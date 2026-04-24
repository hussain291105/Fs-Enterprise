import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET bill items for a specific bill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');
    
    const items = await collection.find({ id: Number(id) }).toArray();
    
    const formattedItems = items.map(item => ({
      gsm_number: item.gsm_number,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));
    
    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Fetch bill items error:', error);
    return NextResponse.json({ error: 'Failed to fetch bill items' }, { status: 500 });
  }
}

// PUT update bill items
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('PUT /api/billing/[id]/items - Received:', { id, body });

    const { items, customer_name, phone_number, payment_mode, status, bill_date, subtotal } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('No items provided or empty array');
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');

    // Get existing bill to preserve header info if not provided
    const existingBill = await collection.findOne({ id: Number(id) });
    if (!existingBill) {
      console.error('Bill not found:', id);
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const headerData = {
      customer_name: customer_name || existingBill?.customer_name,
      phone_number: phone_number || existingBill?.phone_number,
      payment_mode: payment_mode || existingBill?.payment_mode,
      status: status || existingBill?.status,
      bill_date: bill_date || existingBill?.bill_date,
      subtotal: subtotal || existingBill?.subtotal,
    };

    console.log('Deleting existing items for bill:', id);
    // Delete existing bill items for this bill
    const deleteResult = await collection.deleteMany({ id: Number(id) });
    console.log('Deleted count:', deleteResult.deletedCount);

    // Insert new bill items with header data
    const newDocuments = items.map(item => ({
      id: Number(id),
      ...headerData,
      gsm_number: item.gsm_number,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      createdAt: existingBill?.createdAt || new Date(),
      updatedAt: new Date(),
    }));

    console.log('Inserting new documents:', newDocuments.length);
    await collection.insertMany(newDocuments);
    console.log('Insert successful');

    return NextResponse.json({ success: true, message: 'Bill items updated successfully' });
  } catch (error) {
    console.error('Update bill items error:', error);
    return NextResponse.json({ error: 'Failed to update bill items' }, { status: 500 });
  }
}
