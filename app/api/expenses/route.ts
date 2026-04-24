import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('expenses');

    const expenses = await collection.find({}).sort({ created_at: -1 }).toArray();

    // Map to include string id from _id for frontend
    const formattedExpenses = expenses.map((exp: any) => ({
      id: exp._id.toString(),
      item: exp.item,
      qty: exp.qty,
      amount: exp.amount,
      created_at: exp.created_at,
    }));

    return NextResponse.json(formattedExpenses);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item, qty, amount } = body;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('expenses');

    const result = await collection.insertOne({
      item,
      qty,
      amount,
      created_at: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      item,
      qty,
      amount,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}