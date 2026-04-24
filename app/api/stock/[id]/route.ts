import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// PUT update stock item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('stock_items');

    // Check if item exists
    const item = await collection.findOne({ id: Number(id) });
    if (!item) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {
      gsm_number: body.gsm_number,
      category: body.category,
      description: body.description,
      cost_price: body.cost_price,
      selling_price: body.selling_price,
      updated_at: new Date()
    };

    // Add optional fields if provided
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.minimum_stock !== undefined) updateData.minimum_stock = body.minimum_stock;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.kg !== undefined) updateData.kg = body.kg;
    if (body.amount !== undefined) updateData.amount = body.amount;

    // Update the stock item
    await collection.updateOne(
      { id: Number(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update stock error:', error);
    return NextResponse.json({ error: 'Failed to update stock item' }, { status: 500 });
  }
}

// DELETE stock item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('stock_items');
    
    // Check if item exists
    const item = await collection.findOne({ id: Number(id) });
    if (!item) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }
    
    // Delete the stock item
    await collection.deleteOne({ id: Number(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete stock error:', error);
    return NextResponse.json({ error: 'Failed to delete stock item' }, { status: 500 });
  }
}
