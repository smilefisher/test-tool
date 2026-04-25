import { NextRequest, NextResponse } from 'next/server';
import { getConnectionById, updateConnection, deleteConnection } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await getConnectionById(parseInt(id));
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }
    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error fetching connection:', error);
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, db_type, host, port, username, password, database_name, uri } = body;

    if (db_type && !['redis', 'mysql', 'mongodb'].includes(db_type)) {
      return NextResponse.json({ error: 'Invalid db_type' }, { status: 400 });
    }

    const success = await updateConnection(parseInt(id), { name, db_type, host, port, username, password, database_name, uri });
    if (!success) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteConnection(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
