import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import { getGameClient, GrpcEnv } from '@/lib/grpc-client';
import { createEmailRecord } from '@/lib/db';

export async function POST(req: NextRequest) {
  const {
    game_id, zone, role_id, world_id, mail_id, env,
    game_label, role_name, world_name,
  } = await req.json();

  if (!game_id || !zone || !role_id || !world_id || !mail_id) {
    return NextResponse.json({ error: '缺少必要参数: game_id, zone, role_id, world_id, mail_id' }, { status: 400 });
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

  const req_body = { game_id: Number(game_id), zone, role_id, world_id, mail_id };
  console.log('[SendEmail] request:', JSON.stringify(req_body));

  return new Promise<NextResponse>((resolve) => {
    client.SendEmail(
      req_body,
      metadata,
      (err, reply) => {
        if (err) {
          console.error('[SendEmail] error:', { code: err.code, message: err.message, details: err.details });
          createEmailRecord({
            game_id: Number(game_id), game_label: game_label || String(game_id),
            zone, role_id, role_name: role_name || '', world_id, world_name: world_name || '',
            mail_id, env: env || 'test1', success: false, error_msg: err.message || '未知错误',
          }).catch(() => {});
          resolve(NextResponse.json(
            { error: err.message, code: err.code, details: err.details },
            { status: 500 }
          ));
        } else {
          console.log('[SendEmail] reply:', JSON.stringify(reply));
          createEmailRecord({
            game_id: Number(game_id), game_label: game_label || String(game_id),
            zone, role_id, role_name: role_name || '', world_id, world_name: world_name || '',
            mail_id, env: env || 'test1', success: true, error_msg: null,
          }).catch(() => {});
          resolve(NextResponse.json(reply));
        }
      }
    );
  });
}
