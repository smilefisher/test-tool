import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getGameClient, GrpcEnv } from '@/lib/grpc-client';
import { getAllApiTokens } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { game_id, zone, role_id, world_id, mail_id, code, role_uin, token_id, env } = await req.json();

  if (!game_id || !zone || !role_id || !world_id || !mail_id || !token_id) {
    return NextResponse.json({ error: '缺少必要参数: game_id, zone, role_id, world_id, mail_id, token_id' }, { status: 400 });
  }

  const tokens = await getAllApiTokens();
  const token = tokens.find(t => t.id === Number(token_id));
  if (!token) {
    return NextResponse.json({ error: '未找到指定 Token，请先添加' }, { status: 400 });
  }

  const client = getGameClient((env as GrpcEnv) || 'test1');
  const metadata = new grpc.Metadata();
  metadata.set('token', token.value);

  const req_body = { game_id: Number(game_id), zone, role_id, world_id, mail_id };
  console.log('[SendEmail] request:', JSON.stringify(req_body));

  return new Promise<NextResponse>((resolve) => {
    client.SendEmail(
      req_body,
      metadata,
      (err, reply) => {
        if (err) {
          console.error('[SendEmail] error:', { code: err.code, message: err.message, details: err.details });
          resolve(NextResponse.json(
            { error: err.message, code: err.code, details: err.details },
            { status: 500 }
          ));
        } else {
          console.log('[SendEmail] reply:', JSON.stringify(reply));
          resolve(NextResponse.json(reply));
        }
      }
    );
  });
}
