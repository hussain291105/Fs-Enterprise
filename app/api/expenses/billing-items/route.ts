import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET billing items for expenses
export async function GET() {
  try {
    const connection = await db.getConnection();
    
    const sql = 'SELECT * FROM billing ORDER BY id DESC';
    const [rows] = await connection.execute(sql);
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch billing items error:', error);
    return NextResponse.json([]);
  }
}
