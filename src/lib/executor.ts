import Redis from 'ioredis';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import { Connection } from './db';

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
  const config = connection || { host: 'localhost', port: 6379, db: 0 };
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

    if (normalizedCmd.includes('\n')) {
      const results: unknown[] = [];
      const commands = normalizedCmd.split('\n').filter(c => c.trim());
      for (const cmd of commands) {
        const parts = cmd.split(/\s+/);
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
    const [result] = await pool.execute(normalizedSql);
    return result;
  } finally {
    await pool.end();
  }
}

export async function executeMongodb(command: string, connection?: Connection | null): Promise<unknown> {
  const config = connection || { uri: 'mongodb://localhost:27017' };
  const client = new MongoClient(config.uri || 'mongodb://localhost:27017');

  try {
    await client.connect();
    let dbName = config.database_name || config.uri?.split('/').pop()?.split('?')[0] || 'test';
    let normalizedCmd = command.trim();

    const useMatch = normalizedCmd.match(/^use\s+(\w+)\s*;?\s*(.*)$/i);
    if (useMatch) {
      dbName = useMatch[1];
      normalizedCmd = useMatch[2].trim();
    }

    const db = client.db(dbName);

    const match = normalizedCmd.match(/^db\.(\w+)\.(\w+)\(([\s\S]*)\)$/);
    if (!match) {
      throw new Error('Invalid MongoDB command format. Expected: use db; db.collection.method({...})');
    }

    const [, collection, method, argsStr] = match;
    const args = JSON.parse(argsStr);

    const coll = db.collection(collection);
    const mongoMethod = (coll as unknown as Record<string, Function>)[method];

    if (typeof mongoMethod !== 'function') {
      throw new Error(`Unknown MongoDB method: ${method}`);
    }

    return await mongoMethod.call(coll, args);
  } finally {
    await client.close();
  }
}

export function replaceParams(template: string, params: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export async function executeTool(
  steps: Array<{ db_type: string; command: string; connection?: Connection | null }>,
  params: Record<string, string>
): Promise<ExecuteResult[]> {
  const results: ExecuteResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startTime = Date.now();
    const resolvedCommand = replaceParams(step.command, params);

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
