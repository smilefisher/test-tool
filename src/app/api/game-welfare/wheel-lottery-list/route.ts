import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getShopClient, GrpcEnv } from '@/lib/grpc-client';

export async function POST(req: NextRequest) {
  const { circle_id, lottery_type, effect_status, page, page_size, env } = await req.json();

  if (!circle_id) {
    return NextResponse.json({ error: '缺少必要参数: circle_id' }, { status: 400 });
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
    const reqBody: { page: number; page_size: number; circle_id: string; lottery_type?: number; effect_status: boolean } = {
      page: Number(page || 1),
      page_size: Number(page_size || 20),
      circle_id: String(circle_id),
      effect_status: Boolean(effect_status !== false),
    };
    if (lottery_type !== undefined && lottery_type !== null && lottery_type !== '') {
      reqBody.lottery_type = Number(lottery_type);
    }
    client.GetWheelLotteryList(
      reqBody,
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
