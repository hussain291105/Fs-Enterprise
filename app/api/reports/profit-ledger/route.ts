import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

// GET profit ledger data
export async function GET() {
  try {
    const connection = await db.getConnection();
    
    // Get profit ledger entries
    const profitLedgerSql = 'SELECT * FROM profit_ledger ORDER BY id DESC';
    const [profitLedgerRows] = await connection.execute(profitLedgerSql);
    
    // Get billing data for income calculation
    const billingSql = `
      SELECT 
        id,
        bill_date,
        customer_name,
        SUM(total) AS total_amount,
        payment_mode,
        status
      FROM billing
      GROUP BY id, bill_date, customer_name, payment_mode, status
      ORDER BY bill_date DESC
    `;
    const [billingRows] = await connection.execute(billingSql);
    
    // Get expenses data
    const expensesSql = 'SELECT * FROM expenses ORDER BY created_at DESC';
    const [expensesRows] = await connection.execute(expensesSql);
    
    connection.release();
    
    // Combine data for comprehensive profit ledger
    const profitLedgerData = {
      profitLedger: profitLedgerRows,
      billingData: billingRows,
      expensesData: expensesRows,
      summary: {
        totalIncome: (billingRows as any[]).reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0),
        totalExpenses: (expensesRows as any[]).reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0),
        netProfit: 0
      }
    };
    
    profitLedgerData.summary.netProfit = profitLedgerData.summary.totalIncome - profitLedgerData.summary.totalExpenses;
    
    return NextResponse.json(profitLedgerData);
  } catch (error) {
    console.error('Fetch profit ledger error:', error);
    return NextResponse.json([]);
  }
}

// POST bulk insert profit ledger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries, autoGenerate } = body;

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Clear existing data
      await connection.execute('DELETE FROM profit_ledger');

      let allEntries: any[] = [];

      if (autoGenerate) {
        // Auto-generate entries from billing and expenses data
        
        // Get billing data for income entries
        const billingSql = `
          SELECT 
            bill_date as date,
            CONCAT('Bill #', id, ' - ', customer_name) as description,
            'Sales' as category,
            SUM(total) as income,
            0 as expense
          FROM billing
          GROUP BY id, bill_date, customer_name
          ORDER BY bill_date DESC
        `;
        const [billingRows] = await connection.execute(billingSql);
        
        // Get expenses data for expense entries
        const expensesSql = `
          SELECT 
            created_at as date,
            item as description,
            'Expenses' as category,
            0 as income,
            amount as expense
          FROM expenses
          ORDER BY created_at DESC
        `;
        const [expensesRows] = await connection.execute(expensesSql);
        
        // Combine billing and expenses data
        allEntries = [...(billingRows as any[]), ...(expensesRows as any[])];
        
        // Calculate running balance
        let runningBalance = 0;
        allEntries = allEntries.map(entry => {
          runningBalance += parseFloat(entry.income || 0) - parseFloat(entry.expense || 0);
          return {
            ...entry,
            balance: runningBalance
          };
        });
      } else {
        // Use provided entries
        allEntries = entries;
      }

      // Insert all entries
      for (const entry of allEntries) {
        await connection.execute(
          `INSERT INTO profit_ledger 
            (date, description, category, income, expense, balance) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            entry.date,
            entry.description,
            entry.category,
            entry.income,
            entry.expense,
            entry.balance
          ]
        );
      }

      await connection.commit();
      connection.release();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Profit ledger updated successfully',
        entriesGenerated: allEntries.length
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
