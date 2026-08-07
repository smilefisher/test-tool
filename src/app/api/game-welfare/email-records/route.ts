import { NextRequest, NextResponse } from 'next/server';
import { queryEmailRecords } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '10')));
  const todayOnly = searchParams.get('todayOnly') !== 'false';
  const role_id = searchParams.get('role_id')?.trim() || undefined;
  const game_id = searchParams.get('game_id') ? Number(searchParams.get('game_id')) : undefined;

  const result = await queryEmailRecords({ page, pageSize, todayOnly, game_id, role_id });
  return NextResponse.json(result);
}
