import { NextResponse } from 'next/server';

// GET database schema information
export async function GET() {
  try {
    // Mock schema information for development
    const mockSchema = {
      expenses: [
        { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Extra: 'auto_increment' },
        { Field: 'item', Type: 'varchar(255)', Null: 'NO', Key: '', Extra: '' },
        { Field: 'qty', Type: 'int', Null: 'NO', Key: '', Extra: '' },
        { Field: 'amount', Type: 'decimal(10,2)', Null: 'NO', Key: '', Extra: '' },
        { Field: 'created_at', Type: 'timestamp', Null: 'NO', Key: '', Extra: 'DEFAULT CURRENT_TIMESTAMP' }
      ],
      billing: [
        { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Extra: 'auto_increment' },
        { Field: 'customer_name', Type: 'varchar(255)', Null: 'NO', Key: '', Extra: '' },
        { Field: 'phone_number', Type: 'varchar(20)', Null: 'YES', Key: '', Extra: '' },
        { Field: 'payment_mode', Type: 'varchar(50)', Null: 'YES', Key: '', Extra: '' },
        { Field: 'status', Type: 'varchar(50)', Null: 'YES', Key: '', Extra: '' },
        { Field: 'bill_date', Type: 'date', Null: 'NO', Key: '', Extra: '' },
        { Field: 'subtotal', Type: 'decimal(10,2)', Null: 'NO', Key: '', Extra: '' }
      ],
      stock_items: [
        { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Extra: 'auto_increment' },
        { Field: 'gsm_number', Type: 'int', Null: 'NO', Key: '', Extra: '' },
        { Field: 'category', Type: 'varchar(100)', Null: 'NO', Key: '', Extra: '' },
        { Field: 'description', Type: 'text', Null: 'YES', Key: '', Extra: '' },
        { Field: 'cost_price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Extra: '' },
        { Field: 'selling_price', Type: 'decimal(10,2)', Null: 'YES', Key: '', Extra: '' }
      ]
    };
    
    return NextResponse.json(mockSchema);
  } catch (error) {
    console.error('Schema inspection error:', error);
    return NextResponse.json({ 
      error: 'Failed to inspect schema',
      details: error.message 
    }, { status: 500 });
  }
}
