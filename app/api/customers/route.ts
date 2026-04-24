import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET all customers (for autocomplete)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customers');

    let query = {};
    if (search) {
      query = {
        name: { $regex: search, $options: 'i' }
      };
    }

    const customers = await collection.find(query).limit(20).toArray();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST save customer
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone_number } = body;

    if (!name || !phone_number) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customers');

    // Check if customer already exists
    const existing = await collection.findOne({ name });
    if (existing) {
      // Update existing customer
      await collection.updateOne(
        { name },
        { $set: { phone_number, updated_at: new Date() } }
      );
    } else {
      // Create new customer
      await collection.insertOne({
        name,
        phone_number,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save customer error:', error);
    return NextResponse.json({ error: 'Failed to save customer' }, { status: 500 });
  }
}
