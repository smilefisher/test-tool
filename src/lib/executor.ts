import Redis from 'ioredis';
import mysql from 'mysql2/promise';
import { BSON, Document, MongoClient } from 'mongodb';
import { Connection } from './db';
import { getMongoConfigError, getMongoRuntimeParamError, MongoStepConfig, normalizeMongoJson, omitEmptyMongoUpdateParams, parseMongoConfig, stringifyMongoConfig } from './mongodb-config';
import { resolveTimeExpressions } from './template';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const DANGEROUS_MYSQL_COMMANDS = [
  'DROP',
  'TRUNCATE',
  'ALTER',
  'GRANT',
  'REVOKE',
  'CREATE USER',
  'DROP USER',
  'KILL',
  'SHUTDOWN',
  'LOAD DATA',
  'OUTFILE',
  'INFILE',
];

const DANGEROUS_REDIS_COMMANDS = [
  'FLUSHDB',
  'FLUSHALL',
  'SHUTDOWN',
  'DEBUG',
  'SLAVEOF',
  'REPLICAOF',
  'BGSAVE',
  'SAVE',
  'PFSELECT',
  'PFOP',
  'PFMERGE',
];

const DANGEROUS_REDIS_SUBCOMMANDS: Record<string, string[]> = {
  CONFIG: ['SET', 'REWRITE', 'RESETSTAT', 'SETPCT'],
  SCRIPT: ['DEBUG', 'FLUSH', 'KILL', 'LOAD'],
  CLUSTER: ['ADDSLOTS', 'DELSLOTS', 'SETSLOT', 'DELSLOTS', 'ADDSLOTS', 'REPLICAS'],
  READONLY: [],
  READWRITE: [],
  WAIT: [],
  MEMORY: ['USAGE', 'DOCTOR'],
  LATENCY: ['HISTORY', 'RESET', 'GRAPH', 'LATENCY'],
};

const DANGEROUS_MONGODB_OPS = [
  'drop',
  'dropDatabase',
  'dropCollection',
  'dropIndexes',
  'dropIndex',
  'deleteIndexes',
  'deleteIndex',
  'killCursors',
  'killOp',
  'fsync',
  'repairDatabase',
  'compact',
  'cleanupOrphaned',
];

function validateMysql(sql: string): ValidationResult {
  const normalized = sql.trim().toUpperCase();

  const firstWord = normalized.split(/\s+/)[0];

  for (const cmd of DANGEROUS_MYSQL_COMMANDS) {
    if (normalized.includes(cmd)) {
      return { valid: false, error: `禁止执行危险 SQL 命令: ${cmd}` };
    }
  }

  if (firstWord === 'DELETE' || firstWord === 'UPDATE') {
    if (!/\bWHERE\b/i.test(sql)) {
      return { valid: false, error: `${firstWord} 操作必须包含 WHERE 条件` };
    }
  }

  return { valid: true };
}

function validateRedis(command: string): ValidationResult {
  const normalized = command.trim().toUpperCase();
  const parts = normalized.split(/\s+/);
  const cmd = parts[0];

  if (DANGEROUS_REDIS_COMMANDS.includes(cmd)) {
    return { valid: false, error: `禁止执行危险 Redis 命令: ${cmd}` };
  }

  if (cmd === 'CONFIG' && parts.length >= 2) {
    const subcmd = parts[1].toUpperCase();
    if (DANGEROUS_REDIS_SUBCOMMANDS.CONFIG.includes(subcmd)) {
      return { valid: false, error: `禁止执行 Redis CONFIG ${subcmd}` };
    }
  }

  if (cmd === 'SCRIPT' && parts.length >= 2) {
    const subcmd = parts[1].toUpperCase();
    if (DANGEROUS_REDIS_SUBCOMMANDS.SCRIPT.includes(subcmd)) {
      return { valid: false, error: `禁止执行 Redis SCRIPT ${subcmd}` };
    }
  }

  if (cmd === 'CLUSTER' && parts.length >= 2) {
    const subcmd = parts[1].toUpperCase();
    if (DANGEROUS_REDIS_SUBCOMMANDS.CLUSTER.includes(subcmd)) {
      return { valid: false, error: `禁止执行 Redis CLUSTER ${subcmd}` };
    }
  }

  if (cmd === 'MEMORY' && parts.length >= 2) {
    const subcmd = parts[1].toUpperCase();
    if (!['USAGE', 'DOCTOR'].includes(subcmd)) {
      return { valid: false, error: `禁止执行 Redis MEMORY ${subcmd}` };
    }
  }

  if (cmd === 'LATENCY' && parts.length >= 2) {
    const subcmd = parts[1].toUpperCase();
    if (['HISTORY', 'RESET', 'GRAPH'].includes(subcmd)) {
      return { valid: false, error: `禁止执行 Redis LATENCY ${subcmd}` };
    }
  }

  return { valid: true };
}

function validateMongodb(cmd: string): ValidationResult {
  const normalized = cmd.trim();

  for (const op of DANGEROUS_MONGODB_OPS) {
    const pattern = new RegExp(`\\b${op}\\s*\\(`, 'i');
    if (pattern.test(normalized)) {
      return { valid: false, error: `禁止执行 MongoDB 操作: ${op}` };
    }
  }

  const useMatch = normalized.match(/^use\s+(\w+)\s*;?\s*(.*)$/i);
  if (useMatch && useMatch[2].trim()) {
    const actualCmd = useMatch[2].trim();
    for (const op of DANGEROUS_MONGODB_OPS) {
      const pattern = new RegExp(`\\b${op}\\s*\\(`, 'i');
      if (pattern.test(actualCmd)) {
        return { valid: false, error: `禁止执行 MongoDB 操作: ${op}` };
      }
    }
  }

  return { valid: true };
}

export interface ExecuteResult {
  success: boolean;
  stepIndex: number;
  dbType: string;
  command: string;
  result?: unknown;
  error?: string;
  duration: number;
}

export async function executeRedis(command: string, connection?: Connection | null): Promise<unknown> {
  const config = connection || { host: 'localhost', port: 6379, db: 0, password: undefined };

  const redis = new Redis({
    host: config.host || 'localhost',
    port: (config.port as number) || 6379,
    password: config.password || undefined,
    db: config.db || 0,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    const normalizedCmd = command.trim();

    const validation = validateRedis(normalizedCmd);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (normalizedCmd.includes('\n')) {
      const results: unknown[] = [];
      const commands = normalizedCmd.split('\n').filter(c => c.trim());
      for (const cmd of commands) {
        const cmdValidation = validateRedis(cmd.trim());
        if (!cmdValidation.valid) {
          throw new Error(cmdValidation.error);
        }
        const parts = cmd.trim().split(/\s+/);
        const result = await redis.call(...parts as [string, ...string[]]);
        results.push(result);
      }
      return results;
    }

    const parts = normalizedCmd.split(/\s+/);
    return await redis.call(...parts as [string, ...string[]]);
  } finally {
    await redis.quit();
  }
}

export async function executeMysql(command: string, connection?: Connection | null): Promise<unknown> {
  const config = connection || { host: 'localhost', port: 3306, username: 'root', password: '', database_name: 'test' };
  const pool = mysql.createPool({
    host: config.host || 'localhost',
    port: (config.port as number) || 3306,
    user: config.username || 'root',
    password: config.password || '',
    database: config.database_name || 'test',
  });

  try {
    const normalizedSql = command.trim();

    const validation = validateMysql(normalizedSql);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (normalizedSql.includes('\n')) {
      const results: unknown[] = [];
      const statements = normalizedSql.split('\n').filter(s => s.trim());
      for (const stmt of statements) {
        const stmtValidation = validateMysql(stmt.trim());
        if (!stmtValidation.valid) {
          throw new Error(stmtValidation.error);
        }
        const [result] = await pool.query(stmt);
        results.push(result);
      }
      return results;
    }
    const [result] = await pool.query(normalizedSql);
    return result;
  } finally {
    await pool.end();
  }
}

export async function executeMongodb(command: string, connection?: Connection | null): Promise<unknown> {
  const config = connection || { uri: 'mongodb://localhost:27017', database_name: null };
  const client = new MongoClient(config.uri || 'mongodb://localhost:27017');

  try {
    await client.connect();
    const defaultDb = config.database_name || config.uri?.split('/').pop()?.split('?')[0] || 'test';
    const normalizedCmd = command.trim();
    const structuredConfig = parseMongoConfig(normalizedCmd);

    if (structuredConfig) {
      return await executeStructuredMongoCmd(client, structuredConfig);
    }

    const validation = validateMongodb(normalizedCmd);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 按括号深度在顶层换行处分割，避免括号内的换行被切断
    const commands = splitTopLevelCommands(normalizedCmd);
    if (commands.length > 1) {
      const results: unknown[] = [];
      for (const cmd of commands) {
        const cmdValidation = validateMongodb(cmd.trim());
        if (!cmdValidation.valid) {
          throw new Error(cmdValidation.error);
        }
        const result = await executeSingleMongoCmd(client, cmd, defaultDb);
        results.push(result);
      }
      return results;
    }

    return await executeSingleMongoCmd(client, normalizedCmd, defaultDb);
  } finally {
    await client.close();
  }
}

// 在顶层换行处分割多条命令（括号/字符串内部的换行不分割）
// 单独的 use xxx; 会合并到下一行
function splitTopLevelCommands(cmd: string): string[] {
  const raw: string[] = [];
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let start = 0;

  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;
    else if (ch === '\n' && depth === 0) {
      const part = cmd.slice(start, i).trim();
      if (part) raw.push(part);
      start = i + 1;
    }
  }

  const last = cmd.slice(start).trim();
  if (last) raw.push(last);

  // 合并单独的 use xxx; 到下一行
  const result: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (/^use\s+\w+\s*;?\s*$/i.test(raw[i]) && i + 1 < raw.length) {
      result.push(raw[i] + ' ' + raw[i + 1]);
      i++;
    } else {
      result.push(raw[i]);
    }
  }

  return result;
}

// 移除循环引用，确保结果可被 JSON 序列化
function safeSerialize(value: unknown): unknown {
  return JSON.parse(BSON.EJSON.stringify(value, { relaxed: false }));
}

function parseExtendedJson(value: string | undefined, fallback: string): unknown {
  try {
    return BSON.EJSON.parse(normalizeMongoJson(value?.trim() || fallback), { relaxed: false });
  } catch (error) {
    throw new Error(`MongoDB JSON 格式错误: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertDocument(value: unknown, field: string): Document {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${field} 必须是 JSON 对象`);
  }
  return value as Document;
}

async function executeStructuredMongoCmd(client: MongoClient, config: MongoStepConfig): Promise<unknown> {
  const validationError = getMongoConfigError(config);
  if (validationError) throw new Error(validationError);

  const collection = client.db(config.database).collection(config.collection);
  const filter = assertDocument(parseExtendedJson(config.filter, '{}'), 'Filter');
  const options = assertDocument(parseExtendedJson(config.options, '{}'), 'Options');
  let result: unknown;

  switch (config.operation) {
    case 'find': {
      const projection = assertDocument(parseExtendedJson(config.projection, '{}'), 'Projection');
      const sort = assertDocument(parseExtendedJson(config.sort, '{}'), 'Sort');
      const limit = Math.min(Math.max(config.limit ?? 100, 1), 1000);
      let cursor = collection.find(filter, { ...options, projection }).skip(Math.max(config.skip ?? 0, 0)).limit(limit);
      if (Object.keys(sort).length > 0) cursor = cursor.sort(sort);
      result = await cursor.toArray();
      break;
    }
    case 'findOne': {
      const projection = assertDocument(parseExtendedJson(config.projection, '{}'), 'Projection');
      result = await collection.findOne(filter, { ...options, projection });
      break;
    }
    case 'countDocuments':
      result = await collection.countDocuments(filter, options);
      break;
    case 'insertOne':
      result = await collection.insertOne(assertDocument(parseExtendedJson(config.document, '{}'), 'Document'), options);
      break;
    case 'insertMany': {
      const documents = parseExtendedJson(config.documents, '[]');
      if (!Array.isArray(documents) || documents.some(document => !document || typeof document !== 'object' || Array.isArray(document))) {
        throw new Error('Documents 必须是 JSON 对象数组');
      }
      result = await collection.insertMany(documents as Document[], options);
      break;
    }
    case 'updateOne':
    case 'updateMany': {
      if (config.operation === 'updateMany' && Object.keys(filter).length === 0) {
        throw new Error('禁止使用空 Filter 执行 updateMany');
      }
      const update = assertDocument(parseExtendedJson(config.update, '{}'), 'Update');
      result = config.operation === 'updateOne'
        ? await collection.updateOne(filter, update, options)
        : await collection.updateMany(filter, update, options);
      break;
    }
    case 'replaceOne':
      result = await collection.replaceOne(filter, assertDocument(parseExtendedJson(config.replacement, '{}'), 'Replacement'), options);
      break;
    case 'deleteOne':
      result = await collection.deleteOne(filter, options);
      break;
    case 'deleteMany':
      if (Object.keys(filter).length === 0) throw new Error('禁止使用空 Filter 执行 deleteMany');
      result = await collection.deleteMany(filter, options);
      break;
    case 'aggregate': {
      const pipeline = parseExtendedJson(config.pipeline, '[]');
      if (!Array.isArray(pipeline)) throw new Error('Pipeline 必须是 JSON 数组');
      if (pipeline.some(stage => stage && typeof stage === 'object' && ('$out' in stage || '$merge' in stage))) {
        throw new Error('Pipeline 禁止使用 $out 或 $merge');
      }
      result = await collection.aggregate(pipeline as Document[], options).toArray();
      break;
    }
  }

  return safeSerialize(result);
}

// 解析多个逗号分隔的 JSON 对象参数，如: {filter}, {update}, {options}
function parseMongoArgs(argsStr: string): unknown[] {
  const trimmed = argsStr.trim();
  if (!trimmed) return [];

  const args: unknown[] = [];
  let depth = 0;
  let start = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      args.push(JSON.parse(trimmed.slice(start, i).trim()));
      start = i + 1;
    }
  }

  // 最后一个参数
  const last = trimmed.slice(start).trim();
  if (last) args.push(JSON.parse(last));

  return args;
}

async function executeSingleMongoCmd(client: MongoClient, cmd: string, defaultDb: string): Promise<unknown> {
  let dbName = defaultDb;
  // 把所有换行/多余空格压缩成一个空格，避免换行干扰正则匹配
  let normalizedCmd = cmd.replace(/\s+/g, ' ').trim().replace(/;+$/, '').trim();

  const useMatch = normalizedCmd.match(/^use\s+(\w+)\s*;?\s*(.*)$/i);
  if (useMatch) {
    dbName = useMatch[1];
    normalizedCmd = useMatch[2].trim().replace(/;+$/, '').trim();
  }

  const db = client.db(dbName);

  const match = normalizedCmd.match(/^db\.(\w+)\.(\w+)\(([\s\S]*)\)$/);
  if (!match) {
    throw new Error('Invalid MongoDB command format. Expected: use db; db.collection.method({...})');
  }

  const [, collection, method, argsStr] = match;
  const parsedArgs = parseMongoArgs(argsStr);

  const coll = db.collection(collection);
  const mongoMethod = (coll as unknown as Record<string, (...args: unknown[]) => unknown>)[method];

  if (typeof mongoMethod !== 'function') {
    throw new Error(`Unknown MongoDB method: ${method}`);
  }

  const rawResult = await mongoMethod.apply(coll, parsedArgs);

  // find() / aggregate() 返回 Cursor，需要 toArray() 才能拿到数据
  if (
    rawResult
    && typeof rawResult === 'object'
    && 'toArray' in rawResult
    && typeof rawResult.toArray === 'function'
  ) {
    return safeSerialize(await rawResult.toArray());
  }

  // 其他方法（insertOne、updateOne 等）用 JSON 序列化去掉 MongoClient 等循环引用
  return safeSerialize(rawResult);
}

// 支持 {{param}} 和 {{outputKey.field.path}} 两种占位符
export function replaceParams(
  template: string,
  params: Record<string, string>,
  outputs?: Map<string, unknown>
): string {
  const resolvedTemplate = resolveTimeExpressions(template);
  return resolvedTemplate.replace(/\{\{([^}]+)\}\}/g, (match, expr: string) => {
    const key = expr.trim();

    // 先查参数
    if (key in params) return params[key];

    // 再查上一步输出: outputKey.field.subfield
    if (outputs) {
      const dotIndex = key.indexOf('.');
      if (dotIndex > 0) {
        const outputKey = key.slice(0, dotIndex);
        const fieldPath = key.slice(dotIndex + 1);
        if (outputs.has(outputKey)) {
          const val = getNestedValue(outputs.get(outputKey), fieldPath);
          if (val !== undefined) return String(val);
        }
      }
    }

    return match;
  });
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    if (Array.isArray(current)) {
      const idx = parseInt(p, 10);
      if (isNaN(idx)) return undefined;
      current = (current as unknown[])[idx];
    } else {
      current = (current as Record<string, unknown>)[p];
    }
  }
  return current;
}

export async function executeTool(
  steps: Array<{ db_type: string; command: string; connection?: Connection | null; output_key?: string | null }>,
  params: Record<string, string>,
  skipEmptyParams: string[] = [],
): Promise<ExecuteResult[]> {
  const results: ExecuteResult[] = [];
  const outputs = new Map<string, unknown>();

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startTime = Date.now();
    let command = step.command;
    if (step.db_type === 'mongodb') {
      const mongoConfig = parseMongoConfig(command);
      let runtimeConfig = mongoConfig;
      if (mongoConfig) {
        const omitted = omitEmptyMongoUpdateParams(mongoConfig, params, skipEmptyParams);
        if (omitted.skipped) {
          results.push({
            success: true,
            stepIndex: i,
            dbType: step.db_type,
            command: stringifyMongoConfig(omitted.config),
            result: { acknowledged: true, skipped: true, reason: '所有勾选的空参数均已从更新中移除' },
            duration: Date.now() - startTime,
          });
          continue;
        }
        runtimeConfig = omitted.config;
        command = stringifyMongoConfig(omitted.config);
      }
      const paramError = runtimeConfig ? getMongoRuntimeParamError(runtimeConfig, params) : null;
      if (paramError) {
        results.push({
          success: false,
          stepIndex: i,
          dbType: step.db_type,
          command,
          error: paramError,
          duration: Date.now() - startTime,
        });
        break;
      }
    }
    const resolvedCommand = replaceParams(command, params, outputs);

    try {
      let result: unknown;
      switch (step.db_type) {
        case 'redis':
          result = await executeRedis(resolvedCommand, step.connection);
          break;
        case 'mysql':
          result = await executeMysql(resolvedCommand, step.connection);
          break;
        case 'mongodb':
          result = await executeMongodb(resolvedCommand, step.connection);
          break;
        default:
          throw new Error(`Unknown database type: ${step.db_type}`);
      }

      // 如果设置了 output_key，把结果存起来给后续步骤引用
      if (step.output_key) {
        outputs.set(step.output_key, result);
      }

      results.push({
        success: true,
        stepIndex: i,
        dbType: step.db_type,
        command: resolvedCommand,
        result,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      results.push({
        success: false,
        stepIndex: i,
        dbType: step.db_type,
        command: resolvedCommand,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      });
      break;
    }
  }

  return results;
}
