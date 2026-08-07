import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getGameServerClient, GrpcEnv } from '@/lib/grpc-client';

export async function POST(req: NextRequest) {
  const { game_type, env } = await req.json();

  if (game_type == null) {
    return NextResponse.json({ error: '缺少必要参数: game_type' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: '缺少 Authorization header' }, { status: 401 });
  }
  const token = authHeader.substring(7);

  const client = getGameServerClient((env as GrpcEnv) || 'test1');
  const metadata = new grpc.Metadata();
  metadata.set('token', token);

  return new Promise<NextResponse>((resolve) => {
    client.GetGameServerInfo(
      { game_type: Number(game_type) },
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
