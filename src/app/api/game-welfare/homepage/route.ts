import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const circleId = req.nextUrl.searchParams.get('circle_id');
  if (!circleId) {
    return NextResponse.json({ error: '缺少 circle_id 参数' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api-test.docoi.cc/linkage/v1/battle_pass/homepage?circle_id=${encodeURIComponent(circleId)}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '请求失败' },
      { status: 500 }
    );
  }
}
