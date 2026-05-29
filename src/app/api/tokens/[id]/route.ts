import { NextRequest, NextResponse } from 'next/server';
import { deleteApiToken } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await deleteApiToken(Number(id));
  if (!ok) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json({ success: true });
}
