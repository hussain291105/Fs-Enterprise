import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET database health check
export async function GET() {
  try {
    // Test actual MySQL connection
    const connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release();
    
    return NextResponse.json({ 
      status: 'healthy', 
      message: 'MySQL database connection successful',
      test: rows
    });
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json({ 
      status: 'unhealthy', 
      message: 'Database connection failed',
      error: error.message 
    }, { status: 500 });
  }
}
