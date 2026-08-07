import { NextRequest, NextResponse } from 'next/server';
import { getAllApiTokens, createApiToken } from '@/lib/db';

export async function GET() {
  const tokens = await getAllApiTokens();
  // mask value for listing
  return NextResponse.json(tokens.map(t => ({ id: t.id, name: t.name, created_at: t.created_at })));
}

export async function POST(req: NextRequest) {
  const { name, value } = await req.json();
  if (!name?.trim() || !value?.trim()) {
    return NextResponse.json({ error: '名称和 Token 值不能为空' }, { status: 400 });
  }
  const id = await createApiToken(name.trim(), value.trim());
  return NextResponse.json({ id });
}
