import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');

    const bill = await collection.findOne({ id: Number(params.id) });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("Fetch bill error:", error);
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { customer_name, phone_number, bill_date, payment_mode, status, subtotal } = await request.json();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');

    // Update all documents with this bill id
    const result = await collection.updateMany(
      { id: Number(id) },
      {
        $set: {
          customer_name,
          phone_number,
          bill_date,
          payment_mode,
          status,
          subtotal,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bill updated successfully' });
  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('billing');

    // Delete all documents with this bill id
    const result = await collection.deleteMany({ id: Number(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}