import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET expenses report data
export async function GET() {
  try {
    const connection = await db.getConnection();
    
    const sql = 'SELECT * FROM expenses ORDER BY created_at DESC';
    const [rows] = await connection.execute(sql);
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch expenses report error:', error);
    return NextResponse.json([]);
  }
}
