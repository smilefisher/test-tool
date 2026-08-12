export const MONGO_CONFIG_VERSION = 1;

import { isTimeExpression } from './template';

export const MONGO_OPERATIONS = [
  'find',
  'findOne',
  'countDocuments',
  'insertOne',
  'insertMany',
  'updateOne',
  'updateMany',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'aggregate',
] as const;

export type MongoOperation = typeof MONGO_OPERATIONS[number];

export interface MongoStepConfig {
  version: typeof MONGO_CONFIG_VERSION;
  database: string;
  collection: string;
  operation: MongoOperation;
  filter?: string;
  update?: string;
  document?: string;
  documents?: string;
  replacement?: string;
  pipeline?: string;
  projection?: string;
  sort?: string;
  skip?: number;
  limit?: number;
  options?: string;
}

export function createMongoConfig(): MongoStepConfig {
  return {
    version: MONGO_CONFIG_VERSION,
    database: '',
    collection: '',
    operation: 'findOne',
    filter: '{}',
    projection: '{}',
    options: '{}',
  };
}

export function parseMongoConfig(command: string): MongoStepConfig | null {
  try {
    const value = JSON.parse(command) as Partial<MongoStepConfig>;
    if (
      value.version !== MONGO_CONFIG_VERSION
      || typeof value.database !== 'string'
      || typeof value.collection !== 'string'
      || !MONGO_OPERATIONS.includes(value.operation as MongoOperation)
    ) {
      return null;
    }
    return value as MongoStepConfig;
  } catch {
    return null;
  }
}

export function stringifyMongoConfig(config: MongoStepConfig): string {
  return JSON.stringify(config);
}

export function getMongoConfigError(config: MongoStepConfig): string | null {
  if (!config.database.trim()) return '请输入数据库名';
  if (!config.collection.trim()) return '请输入集合名';

  const requiredFields: Partial<Record<MongoOperation, keyof MongoStepConfig>> = {
    find: 'filter',
    findOne: 'filter',
    countDocuments: 'filter',
    insertOne: 'document',
    insertMany: 'documents',
    updateOne: 'update',
    updateMany: 'update',
    replaceOne: 'replacement',
    deleteOne: 'filter',
    deleteMany: 'filter',
    aggregate: 'pipeline',
  };
  const required = requiredFields[config.operation];
  if (required && !String(config[required] ?? '').trim()) return `请填写 ${required}`;

  const jsonFields: (keyof MongoStepConfig)[] = [
    'filter', 'update', 'document', 'documents', 'replacement', 'pipeline',
    'projection', 'sort', 'options',
  ];
  for (const field of jsonFields) {
    const text = config[field];
    if (typeof text !== 'string' || !text.trim()) continue;
    try {
      JSON.parse(normalizeMongoJson(text).replace(/"?\{\{[^}]+\}\}"?/g, '"placeholder"'));
    } catch {
      return `${field} 不是合法 JSON`;
    }
  }
  return null;
}

export function normalizeMongoJson(value: string): string {
  let result = '';
  let index = 0;
  let quote = '';

  while (index < value.length) {
    const character = value[index];
    if (quote) {
      result += character;
      if (character === '\\' && index + 1 < value.length) {
        result += value[++index];
      } else if (character === quote) {
        quote = '';
      }
      index++;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      result += character;
      index++;
      continue;
    }

    const constructor = value.slice(index).match(/^(ObjectId|ISODate)\s*\(\s*(["'])((?:\\.|(?!\2).)*)\2\s*\)/);
    if (constructor) {
      const key = constructor[1] === 'ObjectId' ? '$oid' : '$date';
      const stringValue = constructor[3].replace(/\\'/g, "'").replace(/"/g, '\\"');
      result += `{ "${key}": "${stringValue}" }`;
      index += constructor[0].length;
      continue;
    }

    result += character;
    index++;
  }

  return result;
}

export function getMongoRuntimeParamError(config: MongoStepConfig, params: Record<string, string>): string | null {
  const fields: (keyof MongoStepConfig)[] = [
    'filter', 'update', 'document', 'documents', 'replacement', 'pipeline',
    'projection', 'sort', 'options',
  ];

  for (const field of fields) {
    const value = config[field];
    if (typeof value !== 'string') continue;

    const extendedJsonParams = value.matchAll(/"\$(oid|date)"\s*:\s*"\{\{\s*([^}]+?)\s*\}\}"/g);
    const constructorParams = value.matchAll(/(ObjectId|ISODate)\s*\(\s*["']\{\{\s*([^}]+?)\s*\}\}["']\s*\)/g);
    for (const match of [...extendedJsonParams, ...constructorParams]) {
      const type = match[1].toLowerCase();
      const paramName = match[2];
      if ((type === 'date' || type === 'isodate') && isTimeExpression(paramName)) continue;
      if (!params[paramName]?.trim()) return `参数「${paramName}」不能为空`;
    }
  }
  return null;
}

export function omitEmptyMongoUpdateParams(
  config: MongoStepConfig,
  params: Record<string, string>,
  skipEmptyParams: string[],
): { config: MongoStepConfig; skipped: boolean } {
  if (!['updateOne', 'updateMany'].includes(config.operation) || !config.update) {
    return { config, skipped: false };
  }

  const emptyParams = new Set(skipEmptyParams.filter(name => !params[name]?.trim()));
  if (emptyParams.size === 0) return { config, skipped: false };

  const markerPrefix = '__MONGO_SKIP_EMPTY_PARAM__';
  const markedUpdate = config.update.replace(
    /"?\{\{\s*([^}]+?)\s*\}\}"?/g,
    (match, name: string) => emptyParams.has(name.trim())
      ? JSON.stringify(`${markerPrefix}${name.trim()}`)
      : match,
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalizeMongoJson(markedUpdate));
  } catch {
    return { config, skipped: false };
  }

  const pruned = pruneSkippedValues(parsed, markerPrefix);
  const skipped = !pruned || typeof pruned !== 'object' || Object.keys(pruned as Record<string, unknown>).every(key => {
    const value = (pruned as Record<string, unknown>)[key];
    return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0;
  });

  return {
    config: { ...config, update: JSON.stringify(pruned ?? {}, null, 2) },
    skipped,
  };
}

function pruneSkippedValues(value: unknown, markerPrefix: string): unknown {
  if (typeof value === 'string' && value.startsWith(markerPrefix)) return undefined;
  if (Array.isArray(value)) {
    return value.map(item => pruneSkippedValues(item, markerPrefix)).filter(item => item !== undefined);
  }
  if (!value || typeof value !== 'object') return value;

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const pruned = pruneSkippedValues(child, markerPrefix);
    if (pruned === undefined) continue;
    if (pruned && typeof pruned === 'object' && !Array.isArray(pruned) && Object.keys(pruned as Record<string, unknown>).length === 0) continue;
    result[key] = pruned;
  }
  return result;
}

export function tryConvertLegacyMongoCommand(command: string): MongoStepConfig | null {
  const normalized = command.replace(/\s+/g, ' ').trim().replace(/;+$/, '');
  const useMatch = normalized.match(/^use\s+([^\s;]+)\s*;?\s*(.*)$/i);
  const database = useMatch?.[1] || '';
  const mongoCommand = useMatch?.[2] || normalized;
  const match = mongoCommand.match(/^db\.([\w$-]+)\.([\w$]+)\(([\s\S]*)\)$/);
  if (!match || !MONGO_OPERATIONS.includes(match[2] as MongoOperation)) return null;

  const args = splitMongoArguments(match[3]);
  const operation = match[2] as MongoOperation;
  const config: MongoStepConfig = {
    ...createMongoConfig(),
    database,
    collection: match[1],
    operation,
  };

  if (['find', 'findOne', 'countDocuments', 'deleteOne', 'deleteMany'].includes(operation)) {
    config.filter = args[0] || '{}';
    config.options = args[1] || '{}';
  } else if (operation === 'insertOne') {
    config.document = args[0] || '{}';
    config.options = args[1] || '{}';
  } else if (operation === 'insertMany') {
    config.documents = args[0] || '[]';
    config.options = args[1] || '{}';
  } else if (operation === 'updateOne' || operation === 'updateMany') {
    config.filter = args[0] || '{}';
    config.update = args[1] || '{}';
    config.options = args[2] || '{}';
  } else if (operation === 'replaceOne') {
    config.filter = args[0] || '{}';
    config.replacement = args[1] || '{}';
    config.options = args[2] || '{}';
  } else if (operation === 'aggregate') {
    config.pipeline = args[0] || '[]';
    config.options = args[1] || '{}';
  }
  return config;
}

function splitMongoArguments(input: string): string[] {
  const result: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = '';
  for (let index = 0; index < input.length; index++) {
    const character = input[index];
    if (quote) {
      if (character === '\\') index++;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if ('{[('.includes(character)) depth++;
    else if ('}])'.includes(character)) depth--;
    else if (character === ',' && depth === 0) {
      result.push(input.slice(start, index).trim());
      start = index + 1;
    }
  }
  const last = input.slice(start).trim();
  if (last) result.push(last);
  return result;
}
