import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'src/proto/api/third/game/v1/game.proto');
const INCLUDE_DIR = path.join(process.cwd(), 'src/proto');

export const GRPC_ENVS = {
  test1: '159.75.92.101:21014',
  test2: '159.75.92.101:31014',
} as const;

export type GrpcEnv = keyof typeof GRPC_ENVS;

type GameClient = {
  GetRoleByRoleID: (
    req: { game_id: number; zone: string; role_id: string },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
  SendEmail: (
    req: { game_id: number; zone: string; role_id: string; world_id: string; mail_id: string; code?: string; role_uin?: string },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
};

const _clients: Partial<Record<GrpcEnv, GameClient>> = {};

let _packageDef: ReturnType<typeof protoLoader.loadSync> | null = null;

function getPackageDef() {
  if (_packageDef) return _packageDef;
  _packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true,
    includeDirs: [INCLUDE_DIR],
  });
  return _packageDef;
}

export function getGameClient(env: GrpcEnv = 'test1'): GameClient {
  if (_clients[env]) return _clients[env]!;

  const proto = grpc.loadPackageDefinition(getPackageDef()) as Record<string, unknown>;
  const v1 = (
    ((proto['api'] as Record<string, unknown>)['third'] as Record<string, unknown>)['game'] as Record<string, unknown>
  )['v1'] as Record<string, unknown>;

  _clients[env] = new (v1['Game'] as typeof grpc.Client)(
    GRPC_ENVS[env],
    grpc.credentials.createInsecure()
  ) as unknown as GameClient;

  return _clients[env]!;
}
