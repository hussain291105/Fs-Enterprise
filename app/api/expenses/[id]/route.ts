import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('DELETE /api/expenses/[id] - Received:', { id });

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('expenses');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    console.log('Delete result:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    console.log('PUT /api/expenses/[id] - Received:', { id, body });

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('expenses');

    // Use _id (ObjectId) for lookup
    const query = { _id: new ObjectId(id) };
    console.log('Query:', query);

    // Check if item exists
    const item = await collection.findOne(query);
    if (!item) {
      console.error('Expense not found with query:', query);
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    console.log('Found item:', item);

    // Build update object with all provided fields
    const updateData: any = { updated_at: new Date() };
    if (body.item !== undefined) updateData.item = body.item;
    if (body.qty !== undefined) updateData.qty = body.qty;
    if (body.amount !== undefined) updateData.amount = body.amount;

    console.log('Update data:', updateData);

    const result = await collection.updateOne(query, { $set: updateData });
    console.log('Update result:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}