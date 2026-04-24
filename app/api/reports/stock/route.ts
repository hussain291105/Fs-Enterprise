import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET stock report data
export async function GET() {
  try {
    const connection = await db.getConnection();
    
    const sql = 'SELECT * FROM stock_items ORDER BY id DESC';
    const [rows] = await connection.execute(sql);
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch stock report error:', error);
    return NextResponse.json([]);
  }
}
