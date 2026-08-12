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

export function omitEmptyMongoUpdateFields(
  config: MongoStepConfig,
  params: Record<string, string>,
  skipEmptyParams: string[],
): { config: MongoStepConfig; omittedParams: string[]; emptyUpdate: boolean } {
  if (!['updateOne', 'updateMany'].includes(config.operation) || !config.update) {
    return { config, omittedParams: [], emptyUpdate: false };
  }

  const emptyParams = skipEmptyParams.filter(name => !params[name]?.trim());
  if (emptyParams.length === 0) return { config, omittedParams: [], emptyUpdate: false };

  const markerPrefix = '__MONGO_OMIT_EMPTY__';
  const markedUpdate = config.update.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, name: string) => {
    const normalizedName = name.trim();
    return emptyParams.includes(normalizedName) ? `${markerPrefix}${normalizedName}` : match;
  });

  let parsed: unknown;
  try {
    parsed = new UpdateTemplateParser(normalizeMongoJson(markedUpdate), markerPrefix).parse();
  } catch {
    return { config, omittedParams: [], emptyUpdate: false };
  }

  const pruned = pruneMongoUpdate(parsed, markerPrefix);
  const update = pruned && typeof pruned === 'object' && !Array.isArray(pruned)
    ? pruned as Record<string, unknown>
    : {};
  const emptyUpdate = Object.keys(update).length === 0;
  return {
    config: { ...config, update: JSON.stringify(update, null, 2) },
    omittedParams: emptyParams,
    emptyUpdate,
  };
}

class UpdateTemplateParser {
  private position = 0;

  constructor(private readonly input: string, private readonly markerPrefix: string) {}

  parse(): unknown {
    this.skipWhitespace();
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.position !== this.input.length) throw new Error('Unexpected trailing input');
    return value;
  }

  private parseValue(): unknown {
    this.skipWhitespace();
    if (this.input.startsWith(this.markerPrefix, this.position)) {
      this.position += this.markerPrefix.length;
      while (/[\w.-]/.test(this.peek())) this.position++;
      return this.markerPrefix;
    }
    const character = this.peek();
    if (character === '{') return this.parseObject();
    if (character === '[') return this.parseArray();
    if (character === '"') return this.parseString();

    const end = this.input.slice(this.position).search(/[,}\]]/);
    const length = end < 0 ? this.input.length - this.position : end;
    const token = this.input.slice(this.position, this.position + length).trim();
    this.position += length;
    if (token.includes(this.markerPrefix)) return this.markerPrefix;
    return JSON.parse(token);
  }

  private parseObject(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    this.position++;
    this.skipWhitespace();
    while (this.peek() !== '}') {
      const key = this.parseString();
      this.skipWhitespace();
      this.expect(':');
      result[key] = this.parseValue();
      this.skipWhitespace();
      if (this.peek() === ',') {
        this.position++;
        this.skipWhitespace();
      } else if (this.peek() !== '}') {
        throw new Error('Expected comma');
      }
    }
    this.position++;
    return result;
  }

  private parseArray(): unknown[] {
    const result: unknown[] = [];
    this.position++;
    this.skipWhitespace();
    while (this.peek() !== ']') {
      result.push(this.parseValue());
      this.skipWhitespace();
      if (this.peek() === ',') {
        this.position++;
        this.skipWhitespace();
      } else if (this.peek() !== ']') {
        throw new Error('Expected comma');
      }
    }
    this.position++;
    return result;
  }

  private parseString(): string {
    const start = this.position++;
    while (this.position < this.input.length) {
      if (this.input[this.position] === '\\') {
        this.position += 2;
        continue;
      }
      if (this.input[this.position++] === '"') {
        const raw = this.input.slice(start, this.position);
        if (raw.includes(this.markerPrefix)) return this.markerPrefix;
        return JSON.parse(raw);
      }
    }
    throw new Error('Unterminated string');
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek())) this.position++;
  }

  private expect(character: string): void {
    this.skipWhitespace();
    if (this.peek() !== character) throw new Error(`Expected ${character}`);
    this.position++;
  }

  private peek(): string {
    return this.input[this.position] || '';
  }
}

function pruneMongoUpdate(value: unknown, markerPrefix: string): unknown {
  if (typeof value === 'string' && value.includes(markerPrefix)) return undefined;
  if (Array.isArray(value)) {
    const items = value.map(item => pruneMongoUpdate(item, markerPrefix)).filter(item => item !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (!value || typeof value !== 'object') return value;

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const pruned = pruneMongoUpdate(child, markerPrefix);
    if (pruned === undefined) continue;
    result[key] = pruned;
  }
  return Object.keys(result).length > 0 ? result : undefined;
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
