import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getShopClient, GrpcEnv } from '@/lib/grpc-client';

export async function POST(req: NextRequest) {
  const { wheel_lottery_id, env } = await req.json();

  if (!wheel_lottery_id) {
    return NextResponse.json({ error: '缺少必要参数: wheel_lottery_id' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '缺少 Authorization header' }, { status: 401 });
  }
  const token = authHeader.substring(7);

  const client = getShopClient((env as GrpcEnv) || 'test1');
  const metadata = new grpc.Metadata();
  metadata.set('token', token);

  return new Promise<NextResponse>((resolve) => {
    client.GetWheelLotteryPrizes(
      { wheel_lottery_id: String(wheel_lottery_id), is_admin: true },
      metadata,
      (err, reply) => {
        if (err) {
          resolve(NextResponse.json(
            { error: err.message, code: err.code, details: err.details },
            { status: 500 }
          ));
        } else {
          resolve(NextResponse.json(reply));
        }
      }
    );
  });
}
