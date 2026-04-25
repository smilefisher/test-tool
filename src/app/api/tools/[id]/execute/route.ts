import { NextRequest, NextResponse } from 'next/server';
import { getToolById } from '@/lib/db';
import { executeTool } from '@/lib/executor';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = await getToolById(parseInt(id));

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    const body = await request.json();
    const { params: executeParams } = body;

    if (!executeParams || typeof executeParams !== 'object') {
      return NextResponse.json({ error: 'Params are required' }, { status: 400 });
    }

    const results = await executeTool(
      tool.steps.map(s => ({
        db_type: s.db_type,
        command: s.command,
        connection: s.connection || null,
      })),
      executeParams
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error executing tool:', error);
    return NextResponse.json({ error: 'Failed to execute tool' }, { status: 500 });
  }
}
