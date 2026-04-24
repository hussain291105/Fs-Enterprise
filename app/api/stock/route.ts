import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('stock_items');
    
    const stockItems = await collection.find({}).sort({ id: -1 }).toArray();
    
    return NextResponse.json(stockItems);
  } catch (error) {
    console.error('Fetch stock error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('stock_items');
    
    // Get the highest ID and increment
    const lastItem = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const newId = lastItem.length > 0 ? lastItem[0].id + 1 : 1;
    
    const newItem = {
      ...body,
      id: newId,
      created_at: new Date(),
    };
    
    await collection.insertOne(newItem);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Create stock error:', error);
    return NextResponse.json({ error: 'Failed to create stock item' }, { status: 500 });
  }
}