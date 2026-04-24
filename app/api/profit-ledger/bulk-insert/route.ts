import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

// POST bulk insert profit ledger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle billing entries directly
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Clear existing profit ledger data
      await connection.execute('DELETE FROM profit_ledger');

      // Insert billing entries as profit ledger entries
      for (const entry of body) {
        // Calculate profit per entry
        const price = parseFloat(entry.price || 0);
        const costPrice = parseFloat(entry.cost_price || 0);
        const quantity = parseFloat(entry.quantity || 1);
        const profit = (price - costPrice) * quantity;

        await connection.execute(
          `INSERT INTO profit_ledger 
            (date, description, category, income, expense, balance) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            entry.bill_date,
            `Bill #${entry.bill_id} - ${entry.description}`,
            'Sales',
            entry.total || (price * quantity),
            0,
            profit
          ]
        );
      }

      await connection.commit();
      connection.release();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Profit ledger updated successfully',
        entriesProcessed: body.length
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Bulk insert profit ledger error:', error);
    return NextResponse.json({ error: 'Failed to update profit ledger' }, { status: 500 });
  }
}
