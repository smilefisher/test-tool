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
    const { params: executeParams, paramOptions = {}, skipEmptyParams = [] } = body;
    const optionNames = Object.entries(paramOptions)
      .filter(([, options]) => options && typeof options === 'object' && (options as { omitWhenEmpty?: unknown }).omitWhenEmpty === true)
      .map(([name]) => name);
    const legacyNames = Array.isArray(skipEmptyParams)
      ? skipEmptyParams.filter((value): value is string => typeof value === 'string')
      : [];
    const normalizedSkipEmptyParams = Array.from(new Set([...optionNames, ...legacyNames]));

    if (!executeParams || typeof executeParams !== 'object') {
      return NextResponse.json({ error: 'Params are required' }, { status: 400 });
    }

    const missingParams = tool.params
      .filter(p => p.required)
      .filter(p => !normalizedSkipEmptyParams.includes(p.name))
      .filter(p => {
        const value = executeParams[p.name];
        return value === undefined || value === null || value === '';
      })
      .map(p => p.label);

    if (missingParams.length > 0) {
      return NextResponse.json(
        { error: `缺少必填参数: ${missingParams.join(', ')}` },
        { status: 400 }
      );
    }

    const results = await executeTool(
      tool.steps.map(s => ({
        db_type: s.db_type,
        command: s.command,
        connection: s.connection || null,
        output_key: s.output_key || null,
      })),
      executeParams,
      normalizedSkipEmptyParams,
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error executing tool:', error);
    return NextResponse.json({ error: 'Failed to execute tool' }, { status: 500 });
  }
}
