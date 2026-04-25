import { NextRequest, NextResponse } from 'next/server';
import { getAllConnections, createConnection } from '@/lib/db';

export async function GET() {
  try {
    const connections = await getAllConnections();
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, db_type, host, port, username, password, database_name, uri } = body;

    if (!name || !db_type) {
      return NextResponse.json({ error: 'Name and db_type are required' }, { status: 400 });
    }

    if (!['redis', 'mysql', 'mongodb'].includes(db_type)) {
      return NextResponse.json({ error: 'Invalid db_type' }, { status: 400 });
    }

    const id = await createConnection({ name, db_type, host, port, username, password, database_name, uri });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}
