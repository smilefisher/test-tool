import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'src/proto/api/third/game/v1/game.proto');
const CIRCLE_PROTO_PATH = path.join(process.cwd(), 'src/proto/circle/service/v1/circle.proto');
const SHOP_PROTO_PATH = path.join(process.cwd(), 'src/proto/shop/service/v1/shop.proto');
const INCLUDE_DIR = path.join(process.cwd(), 'src/proto');

export const GRPC_ENVS = {
  test1: '159.75.92.101:21014',
  test2: '159.75.92.101:31014',
} as const;

export const GRPC_SERVER_ENVS = {
  test1: '159.75.92.101:21002',
  test2: '159.75.92.101:31002',
} as const;

export const GRPC_SHOP_ENVS = {
  test1: '159.75.92.101:21010',
  test2: '159.75.92.101:31010',
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

type GameServerClient = {
  GetGameServerInfo: (
    req: { game_type: number },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
  GetVideoGift: (
    req: { server_id: number },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
  GetCumulativeClockInConfigs: (
    req: { server_id: number; page: number; page_size: number },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
};

type ShopClient = {
  GetWheelLotteryList: (
    req: { page: number; page_size: number; circle_id: string; lottery_type?: number; effect_status: boolean },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
  GetWheelLotteryPrizes: (
    req: { wheel_lottery_id: string; is_admin: boolean },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
  GetWheelLotteryCumulativePrizes: (
    req: { wheel_lottery_id: string; is_admin: boolean },
    metadata: grpc.Metadata,
    callback: (err: grpc.ServiceError | null, reply: unknown) => void
  ) => void;
};

const _clients: Partial<Record<GrpcEnv, GameClient>> = {};
const _serverClients: Partial<Record<GrpcEnv, GameServerClient>> = {};
const _shopClients: Partial<Record<GrpcEnv, ShopClient>> = {};

let _packageDef: ReturnType<typeof protoLoader.loadSync> | null = null;
let _circlePackageDef: ReturnType<typeof protoLoader.loadSync> | null = null;
let _shopPackageDef: ReturnType<typeof protoLoader.loadSync> | null = null;

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

function getCirclePackageDef() {
  if (_circlePackageDef) return _circlePackageDef;
  _circlePackageDef = protoLoader.loadSync(CIRCLE_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true,
    includeDirs: [INCLUDE_DIR],
  });
  return _circlePackageDef;
}

function getShopPackageDef() {
  if (_shopPackageDef) return _shopPackageDef;
  _shopPackageDef = protoLoader.loadSync(SHOP_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: Number,
    defaults: true,
    oneofs: true,
    includeDirs: [INCLUDE_DIR],
  });
  return _shopPackageDef;
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

export function getGameServerClient(env: GrpcEnv = 'test1'): GameServerClient {
  if (_serverClients[env]) return _serverClients[env]!;

  const proto = grpc.loadPackageDefinition(getCirclePackageDef()) as Record<string, unknown>;
  const v1 = (
    (proto['circle'] as Record<string, unknown>)['service'] as Record<string, unknown>
  )['v1'] as Record<string, unknown>;

  _serverClients[env] = new (v1['Circle'] as typeof grpc.Client)(
    GRPC_SERVER_ENVS[env],
    grpc.credentials.createInsecure()
  ) as unknown as GameServerClient;

  return _serverClients[env]!;
}

export function getShopClient(env: GrpcEnv = 'test1'): ShopClient {
  if (_shopClients[env]) return _shopClients[env]!;

  const proto = grpc.loadPackageDefinition(getShopPackageDef()) as Record<string, unknown>;
  const v1 = (
    (proto['shop'] as Record<string, unknown>)['service'] as Record<string, unknown>
  )['v1'] as Record<string, unknown>;

  _shopClients[env] = new (v1['shop'] as typeof grpc.Client)(
    GRPC_SHOP_ENVS[env],
    grpc.credentials.createInsecure()
  ) as unknown as ShopClient;

  return _shopClients[env]!;
}
