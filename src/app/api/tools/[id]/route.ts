import { NextRequest, NextResponse } from 'next/server';
import { getToolById, updateTool, deleteTool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = await getToolById(parseInt(id));
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, params: toolParams, steps } = body;

    const success = await updateTool(parseInt(id), { name, description, params: toolParams, steps });
    if (!success) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteTool(parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}
