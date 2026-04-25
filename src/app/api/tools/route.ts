import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, createTool } from '@/lib/db';

export async function GET() {
  try {
    const tools = await getAllTools();
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, params, steps } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const toolId = await createTool({ name, description, params, steps });
    return NextResponse.json({ id: toolId }, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}
