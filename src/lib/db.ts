import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'tools.json');

export interface Connection {
  id: number;
  name: string;
  db_type: 'redis' | 'mysql' | 'mongodb';
  host: string | null;
  port: number | null;
  db: number | null;
  username: string | null;
  password: string | null;
  database_name: string | null;
  uri: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolParam {
  id: number;
  tool_id: number;
  name: string;
  label: string;
  param_type: string;
  default_value: string | null;
  required: number;
}

export interface ToolStep {
  id: number;
  tool_id: number;
  order_index: number;
  db_type: string;
  command: string;
  description: string | null;
  connection_id: number | null;
  output_key: string | null;
}

export interface ToolWithDetails extends Tool {
  params: ToolParam[];
  steps: (ToolStep & { connection?: Connection })[];
}

export interface ApiToken {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

export interface EmailRecord {
  id: number;
  game_id: number;
  game_label: string;
  zone: string;
  role_id: string;
  role_name: string;
  world_id: string;
  world_name: string;
  mail_id: string;
  env: string;
  success: boolean;
  error_msg: string | null;
  created_at: string;
}

interface Database {
  connections: Connection[];
  tools: Tool[];
  tool_params: ToolParam[];
  tool_steps: ToolStep[];
  api_tokens: ApiToken[];
  email_records: EmailRecord[];
  nextIds: {
    connections: number;
    tools: number;
    tool_params: number;
    tool_steps: number;
    api_tokens: number;
    email_records: number;
  };
}

function getDefaultDb(): Database {
  return {
    connections: [],
    tools: [],
    tool_params: [],
    tool_steps: [],
    api_tokens: [],
    email_records: [],
    nextIds: {
      connections: 1,
      tools: 1,
      tool_params: 1,
      tool_steps: 1,
      api_tokens: 1,
      email_records: 1,
    },
  };
}

let cachedDb: Database | null = null;

function loadDb(): Database {
  if (cachedDb) return cachedDb;

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8');
    cachedDb = JSON.parse(data);
    // migrate existing data that lacks api_tokens
    if (!cachedDb!.api_tokens) cachedDb!.api_tokens = [];
    if (!cachedDb!.nextIds.api_tokens) cachedDb!.nextIds.api_tokens = 1;
    if (!cachedDb!.email_records) cachedDb!.email_records = [];
    if (!cachedDb!.nextIds.email_records) cachedDb!.nextIds.email_records = 1;
    // migrate existing steps that lack output_key
    for (const s of cachedDb!.tool_steps) {
      if (s.output_key === undefined) s.output_key = null;
    }
  } else {
    cachedDb = getDefaultDb();
    saveDb();
  }

  return cachedDb!;
}

function saveDb(): void {
  if (!cachedDb) return;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(cachedDb, null, 2));
}

export async function getAllConnections(): Promise<Connection[]> {
  const db = loadDb();
  return db.connections.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function getConnectionById(id: number): Promise<Connection | null> {
  const db = loadDb();
  return db.connections.find(c => c.id === id) || null;
}

export async function createConnection(data: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = loadDb();
  const id = db.nextIds.connections++;
  const now = new Date().toISOString();
  db.connections.push({
    ...data,
    id,
    created_at: now,
    updated_at: now,
  });
  saveDb();
  return id;
}

export async function updateConnection(id: number, data: Partial<Omit<Connection, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
  const db = loadDb();
  const conn = db.connections.find(c => c.id === id);
  if (!conn) return false;

  Object.assign(conn, data, { updated_at: new Date().toISOString() });
  saveDb();
  return true;
}

export async function deleteConnection(id: number): Promise<boolean> {
  const db = loadDb();
  const index = db.connections.findIndex(c => c.id === id);
  if (index === -1) return false;
  db.connections.splice(index, 1);
  saveDb();
  return true;
}

export async function getAllTools(): Promise<Tool[]> {
  const db = loadDb();
  return db.tools.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function getToolById(id: number): Promise<ToolWithDetails | null> {
  const db = loadDb();
  const tool = db.tools.find(t => t.id === id);
  if (!tool) return null;

  const params = db.tool_params.filter(p => p.tool_id === id);
  const stepsRaw = db.tool_steps.filter(s => s.tool_id === id).sort((a, b) => a.order_index - b.order_index);

  const steps = stepsRaw.map(step => {
    if (step.connection_id) {
      const connection = db.connections.find(c => c.id === step.connection_id);
      return { ...step, connection };
    }
    return { ...step, connection: undefined };
  });

  return { ...tool, params, steps };
}

export async function createTool(data: { name: string; description?: string; params?: Omit<ToolParam, 'id' | 'tool_id'>[]; steps?: Omit<ToolStep, 'id' | 'tool_id'>[] }): Promise<number> {
  console.log('createTool received:', JSON.stringify(data));
  const db = loadDb();
  const id = db.nextIds.tools++;
  const now = new Date().toISOString();

  db.tools.push({
    id,
    name: data.name,
    description: data.description || null,
    created_at: now,
    updated_at: now,
  });

  if (data.params) {
    console.log('Saving params:', JSON.stringify(data.params));
    data.params.forEach(p => {
      const paramId = db.nextIds.tool_params++;
      db.tool_params.push({
        ...p,
        id: paramId,
        tool_id: id,
      });
    });
  } else {
    console.log('No params to save');
  }

  if (data.steps) {
    data.steps.forEach((s, index) => {
      const stepId = db.nextIds.tool_steps++;
      db.tool_steps.push({
        ...s,
        id: stepId,
        tool_id: id,
        order_index: index,
      });
    });
  }

  saveDb();
  console.log('Tool saved, id:', id);
  return id;
}

export async function updateTool(id: number, data: { name?: string; description?: string; params?: Omit<ToolParam, 'id' | 'tool_id'>[]; steps?: Omit<ToolStep, 'id' | 'tool_id'>[] }): Promise<boolean> {
  const db = loadDb();
  const tool = db.tools.find(t => t.id === id);
  if (!tool) return false;

  if (data.name !== undefined) tool.name = data.name;
  if (data.description !== undefined) tool.description = data.description;
  tool.updated_at = new Date().toISOString();

  if (data.params !== undefined) {
    db.tool_params = db.tool_params.filter(p => p.tool_id !== id);
    data.params.forEach(p => {
      const paramId = db.nextIds.tool_params++;
      db.tool_params.push({
        ...p,
        id: paramId,
        tool_id: id,
      });
    });
  }

  if (data.steps !== undefined) {
    db.tool_steps = db.tool_steps.filter(s => s.tool_id !== id);
    data.steps.forEach((s, index) => {
      const stepId = db.nextIds.tool_steps++;
      db.tool_steps.push({
        ...s,
        id: stepId,
        tool_id: id,
        order_index: index,
      });
    });
  }

  saveDb();
  return true;
}

export async function deleteTool(id: number): Promise<boolean> {
  const db = loadDb();
  const index = db.tools.findIndex(t => t.id === id);
  if (index === -1) return false;

  db.tools.splice(index, 1);
  db.tool_params = db.tool_params.filter(p => p.tool_id !== id);
  db.tool_steps = db.tool_steps.filter(s => s.tool_id !== id);
  saveDb();
  return true;
}

export async function getAllApiTokens(): Promise<ApiToken[]> {
  const db = loadDb();
  return db.api_tokens.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createApiToken(name: string, value: string): Promise<number> {
  const db = loadDb();
  const id = db.nextIds.api_tokens++;
  db.api_tokens.push({ id, name, value, created_at: new Date().toISOString() });
  saveDb();
  return id;
}

export async function deleteApiToken(id: number): Promise<boolean> {
  const db = loadDb();
  const index = db.api_tokens.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.api_tokens.splice(index, 1);
  saveDb();
  return true;
}

export async function createEmailRecord(data: Omit<EmailRecord, 'id' | 'created_at'>): Promise<number> {
  const db = loadDb();
  const id = db.nextIds.email_records++;
  db.email_records.push({ ...data, id, created_at: new Date().toISOString() });
  saveDb();
  return id;
}

export async function queryEmailRecords(opts: {
  page: number;
  pageSize: number;
  todayOnly: boolean;
  game_id?: number;
  role_id?: string;
}): Promise<{ total: number; records: EmailRecord[] }> {
  const db = loadDb();
  let records = [...db.email_records];

  if (opts.todayOnly) {
    const todayStr = new Date().toISOString().slice(0, 10);
    records = records.filter(r => r.created_at.startsWith(todayStr));
  }
  if (opts.game_id != null) {
    records = records.filter(r => r.game_id === opts.game_id);
  }
  if (opts.role_id) {
    records = records.filter(r => r.role_id === opts.role_id);
  }

  records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = records.length;
  const start = (opts.page - 1) * opts.pageSize;
  return { total, records: records.slice(start, start + opts.pageSize) };
}
