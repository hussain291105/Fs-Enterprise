import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET billing report data
export async function GET() {
  try {
    const connection = await db.getConnection();
    
    // Get billing data grouped by bill
    const sql = `
      SELECT 
        id,
        customer_name,
        phone_number,
        bill_date,
        SUM(total) AS subtotal,
        payment_mode,
        status
      FROM billing
      GROUP BY id, customer_name, phone_number, bill_date, payment_mode, status
      ORDER BY bill_date DESC
    `;
    
    const [rows] = await connection.execute(sql);
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Billing report error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing report' }, { status: 500 });
  }
}
