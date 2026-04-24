import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET bill with items
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const connection = await db.getConnection();
    
    // Get bill items for the specific bill ID
    const sql = `
      SELECT 
        id,
        customer_name,
        phone_number,
        bill_date,
        payment_mode,
        status,
        gsm_number,
        description,
        quantity,
        price,
        total
      FROM billing 
      WHERE id = ?
    `;
    
    const [rows] = await connection.execute(sql, [id]);
    connection.release();
    
    const billItems = rows as any[];
    
    if (billItems.length === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Group bill data
    const bill = {
      id: billItems[0].id,
      bill_number: `INV-${String(billItems[0].id).padStart(4, '0')}`,
      customer_name: billItems[0].customer_name,
      phone_number: billItems[0].phone_number,
      bill_date: billItems[0].bill_date,
      subtotal: billItems.reduce((sum, item) => sum + item.total, 0),
      payment_mode: billItems[0].payment_mode,
      status: billItems[0].status
    };

    const items = billItems.map(item => ({
      gsm_number: item.gsm_number,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    return NextResponse.json({ bill, items });
  } catch (error) {
    console.error('View bill error:', error);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}
