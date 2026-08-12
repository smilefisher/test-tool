export interface Tool {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolParam {
  id?: number;
  tool_id?: number;
  name: string;
  label: string;
  param_type: string;
  default_value: string | null;
  required: boolean;
}

export interface ToolStep {
  id?: number;
  tool_id?: number;
  order_index?: number;
  db_type: string;
  command: string;
  description: string | null;
  output_key: string | null;
}

export interface ToolWithDetails extends Tool {
  params: ToolParam[];
  steps: ToolStep[];
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

export type DbType = 'redis' | 'mysql' | 'mongodb';
