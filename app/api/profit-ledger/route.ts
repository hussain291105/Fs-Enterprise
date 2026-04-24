import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET profit ledger data
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const billingCollection = db.collection('billing');
    const stockCollection = db.collection('stock_items');
    
    // Get all billing data
    const billingData = await billingCollection.find({}).sort({ bill_date: -1, id: -1 }).toArray();
    
    // Get stock items for cost price lookup
    const stockItems = await stockCollection.find({}).toArray();
    const stockMap = new Map(stockItems.map(item => [item.gsm_number, item.cost_price]));
    
    // Add cost price to billing data
    const ledgerData = billingData.map(bill => ({
      bill_id: bill.id,
      bill_date: bill.bill_date,
      customer_name: bill.customer_name,
      gsm_number: bill.gsm_number,
      description: bill.description,
      quantity: bill.quantity,
      price: bill.price,
      total: bill.total,
      cost_price: stockMap.get(bill.gsm_number) || 0
    }));
    
    return NextResponse.json(ledgerData);
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

    const client = await clientPromise;
    const db = client.db();
    const ledgerCollection = db.collection('profit_ledger');
    const billingCollection = db.collection('billing');
    const expensesCollection = db.collection('expenses');
    
    // Clear existing data
    await ledgerCollection.deleteMany({});

    let allEntries: any[] = [];

    if (autoGenerate) {
      // Auto-generate entries from billing and expenses data
      
      // Get billing data for income entries
      const billingData = await billingCollection.find({}).toArray();
      const billingGrouped = billingData.reduce((acc: any[], bill: any) => {
        const existing = acc.find((b: any) => b.id === bill.id);
        if (existing) {
          existing.total += Number(bill.total);
        } else {
          acc.push({
            date: bill.bill_date,
            description: `Bill #${bill.id} - ${bill.customer_name}`,
            category: 'Sales',
            income: Number(bill.total),
            expense: 0
          });
        }
        return acc;
      }, []);
      
      // Get expenses data for expense entries
      const expensesData = await expensesCollection.find({}).sort({ created_at: -1 }).toArray();
      const expensesEntries = expensesData.map((expense: any) => ({
        date: expense.created_at,
        description: expense.item,
        category: 'Expenses',
        income: 0,
        expense: Number(expense.amount)
      }));
      
      // Combine billing and expenses data
      allEntries = [...billingGrouped, ...expensesEntries];
      
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
    if (allEntries.length > 0) {
      await ledgerCollection.insertMany(allEntries);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profit ledger updated successfully',
      entriesGenerated: allEntries.length
    });
  } catch (error) {
    console.error('Bulk insert profit ledger error:', error);
    return NextResponse.json({ error: 'Failed to update profit ledger' }, { status: 500 });
  }
}
