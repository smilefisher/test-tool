import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getGameClient, GrpcEnv } from '@/lib/grpc-client';

export async function POST(req: NextRequest) {
  const { game_id, zone, role_id, env } = await req.json();

  if (!game_id || !zone || !role_id) {
    return NextResponse.json({ error: '缺少必要参数: game_id, zone, role_id' }, { status: 400 });
  }

  // 从 Authorization header 获取 token
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '缺少 Authorization header' }, { status: 401 });
  }
  const token = authHeader.substring(7);

  const client = getGameClient((env as GrpcEnv) || 'test1');
  const metadata = new grpc.Metadata();
  metadata.set('token', token);

  return new Promise<NextResponse>((resolve) => {
    client.GetRoleByRoleID(
      { game_id: Number(game_id), zone, role_id },
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
