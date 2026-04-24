import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET phone number for customer
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;

    const connection = await db.getConnection();
    
    // Find the most recent bill for this customer
    const sql = `
      SELECT phone_number 
      FROM billing 
      WHERE customer_name = ? AND phone_number IS NOT NULL AND phone_number != ''
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const [rows] = await connection.execute(sql, [name]);
    connection.release();
    
    const result = rows as any[];
    
    if (result.length === 0) {
      return NextResponse.json({ phone_number: '' });
    }

    return NextResponse.json({ phone_number: result[0].phone_number });
  } catch (error) {
    console.error('Get phone error:', error);
    return NextResponse.json({ error: 'Failed to fetch phone number' }, { status: 500 });
  }
}
