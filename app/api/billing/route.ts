import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all bills
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');
    
    // Get all bills, grouped by id
    const bills = await collection.find({}).sort({ bill_date: -1 }).toArray();
    
    // Group bills by id and calculate totals
    const groupedBills = bills.reduce((acc: any[], bill: any) => {
      const existing = acc.find((b: any) => b.id === bill.id);
      if (existing) {
        existing.subtotal += Number(bill.total);
      } else {
        acc.push({
          id: bill.id,
          customer_name: bill.customer_name,
          phone_number: bill.phone_number,
          bill_date: bill.bill_date,
          subtotal: Number(bill.total),
          payment_mode: bill.payment_mode,
          status: bill.status,
        });
      }
      return acc;
    }, []);
    
    // Format bill numbers
    const formattedBills = groupedBills.map((bill: any) => ({
      ...bill,
      bill_number: `INV-${String(bill.id).padStart(4, '0')}`
    }));
    
    return NextResponse.json(formattedBills);
  } catch (error) {
    console.error('Fetch billing error:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

// POST create new bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, phone_number, payment_mode, status, bill_date, items, subtotal } = body;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');
    
    // Get the next bill ID
    const lastBill = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = lastBill.length > 0 ? (lastBill[0].id || 0) + 1 : 1;
    
    // Insert each bill item as a separate document
    for (const item of items) {
      await collection.insertOne({
        id: nextId,
        customer_name,
        phone_number,
        payment_mode,
        status,
        bill_date,
        gsm_number: item.gsm_number,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        subtotal,
        createdAt: new Date(),
      });
    }
    
    return NextResponse.json({
      success: true,
      id: nextId,
      bill_number: `INV-${String(nextId).padStart(4, '0')}`,
    });
  } catch (error) {
    console.error('Save bill error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save bill' }, { status: 500 });
  }
}
