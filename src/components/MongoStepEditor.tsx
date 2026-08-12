'use client';

import { useState } from 'react';
import {
  createMongoConfig,
  getMongoConfigError,
  MongoOperation,
  MongoStepConfig,
  normalizeMongoJson,
  parseMongoConfig,
  stringifyMongoConfig,
  tryConvertLegacyMongoCommand,
} from '@/lib/mongodb-config';

interface MongoStepEditorProps {
  command: string;
  onChange: (command: string) => void;
}

const OPERATION_LABELS: Record<MongoOperation, string> = {
  find: '查询多条 find',
  findOne: '查询单条 findOne',
  countDocuments: '统计 countDocuments',
  insertOne: '新增单条 insertOne',
  insertMany: '新增多条 insertMany',
  updateOne: '更新单条 updateOne',
  updateMany: '更新多条 updateMany',
  replaceOne: '替换单条 replaceOne',
  deleteOne: '删除单条 deleteOne',
  deleteMany: '删除多条 deleteMany',
  aggregate: '聚合 aggregate',
};

const JSON_FIELDS: Partial<Record<MongoOperation, { key: keyof MongoStepConfig; label: string; placeholder: string }[]>> = {
  find: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'projection', label: 'Projection（可选）', placeholder: '{}' },
    { key: 'sort', label: 'Sort（可选）', placeholder: '{"createdAt": -1}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  findOne: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'projection', label: 'Projection（可选）', placeholder: '{}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  countDocuments: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  insertOne: [
    { key: 'document', label: 'Document', placeholder: '{\n  "createdAt": { "$date": "{{createdAt}}" }\n}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  insertMany: [
    { key: 'documents', label: 'Documents', placeholder: '[\n  {},\n  {}\n]' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  updateOne: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'update', label: 'Update', placeholder: '{\n  "$set": {}\n}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{"upsert": false}' },
  ],
  updateMany: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'update', label: 'Update', placeholder: '{\n  "$set": {}\n}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  replaceOne: [
    { key: 'filter', label: 'Filter', placeholder: '{}' },
    { key: 'replacement', label: 'Replacement', placeholder: '{}' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
  deleteOne: [{ key: 'filter', label: 'Filter', placeholder: '{}' }],
  deleteMany: [{ key: 'filter', label: 'Filter', placeholder: '{}' }],
  aggregate: [
    { key: 'pipeline', label: 'Pipeline', placeholder: '[\n  { "$match": {} }\n]' },
    { key: 'options', label: 'Options（可选）', placeholder: '{}' },
  ],
};

export default function MongoStepEditor({ command, onChange }: MongoStepEditorProps) {
  const parsed = parseMongoConfig(command);
  const converted = parsed ? null : tryConvertLegacyMongoCommand(command);
  const [config, setConfig] = useState<MongoStepConfig>(parsed || converted || createMongoConfig());
  const legacyCommand = !parsed && !converted && command.trim() ? command : '';
  const [showLegacy, setShowLegacy] = useState(Boolean(legacyCommand));
  const [showHelp, setShowHelp] = useState(false);
  const error = getMongoConfigError(config);

  function update<K extends keyof MongoStepConfig>(key: K, value: MongoStepConfig[K]) {
    const next = { ...config, [key]: value };
    setConfig(next);
    onChange(stringifyMongoConfig(next));
  }

  function formatField(field: keyof MongoStepConfig) {
    const value = config[field];
    if (typeof value !== 'string' || !value.trim()) return;
    try {
      update(field, JSON.stringify(JSON.parse(normalizeMongoJson(value)), null, 2) as never);
    } catch {
      // The validation message below explains malformed JSON.
    }
  }

  if (legacyCommand && showLegacy) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">旧 MongoDB 命令无法自动转换</p>
        <p className="mt-1 text-xs text-amber-700">请按新的结构化格式重新填写；保存前原命令不会被覆盖。</p>
        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-slate-700">{legacyCommand}</pre>
        <button
          type="button"
          onClick={() => {
            setShowLegacy(false);
            onChange(stringifyMongoConfig(config));
          }}
          className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          转为结构化配置
        </button>
      </div>
    );
  }

  const fields = JSON_FIELDS[config.operation] || [];
  return (
    <div className="space-y-4 rounded-xl border border-green-200 bg-green-50/50 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          数据库名 *
          <input
            value={config.database}
            onChange={(event) => update('database', event.target.value)}
            placeholder="user_center"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          集合名 *
          <input
            value={config.collection}
            onChange={(event) => update('collection', event.target.value)}
            placeholder="users"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          操作类型 *
          <select
            value={config.operation}
            onChange={(event) => update('operation', event.target.value as MongoOperation)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          >
            {Object.entries(OPERATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {fields.map((field) => (
        <label key={field.key} className="block text-sm font-medium text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {field.label}
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                aria-label="查看 MongoDB 输入帮助"
                title="查看输入帮助"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-500 transition-colors hover:border-green-500 hover:text-green-700"
              >
                ?
              </button>
            </span>
            <button type="button" onClick={() => formatField(field.key)} className="text-xs font-normal text-green-700 hover:underline">
              格式化 JSON
            </button>
          </span>
          <textarea
            value={String(config[field.key] ?? '')}
            onChange={(event) => update(field.key, event.target.value as never)}
            placeholder={field.placeholder}
            rows={field.key === 'pipeline' || field.key === 'update' ? 6 : 4}
            className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm leading-6 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </label>
      ))}

      {config.operation === 'find' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Skip
            <input type="number" min={0} value={config.skip ?? 0} onChange={(event) => update('skip', Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700">Limit
            <input type="number" min={1} max={1000} value={config.limit ?? 100} onChange={(event) => update('limit', Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
      )}

      <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
        支持 <code>ISODate(&quot;{'{{startTime}}'}&quot;)</code>、<code>ObjectId(&quot;{'{{id}}'}&quot;)</code>。动态时间可用 <code>{'{{now}}'}</code>、<code>{'{{now+2h}}'}</code>、<code>{'{{now-7d}}'}</code>。
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mongo-input-help-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowHelp(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="mongo-input-help-title" className="text-lg font-semibold text-slate-800">MongoDB 输入帮助</h3>
                <p className="mt-1 text-sm text-slate-500">输入 JSON，可使用工具参数和动态时间表达式。</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="关闭帮助"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-5 text-sm text-slate-700">
              <HelpExample
                title="引用工具参数"
                description="参数会在执行前替换。字符串参数需要保留双引号，数字参数不要加引号。"
                code={'{\n  "relation_key": "{{relationKey}}",\n  "status": {{status}}\n}'}
              />
              <HelpExample
                title="ObjectId"
                description="两种格式都支持，参数值应为 24 位十六进制字符串。"
                code={'{ "_id": ObjectId("{{request_id}}") }\n\n{ "_id": { "$oid": "{{request_id}}" } }'}
              />
              <HelpExample
                title="参数时间"
                description="引用页面中的日期时间参数。"
                code={'{\n  "created_at": {\n    "$gte": { "$date": "{{startTime}}" }\n  }\n}'}
              />
              <HelpExample
                title="动态时间函数"
                description="now 是执行时刻；支持秒 s、分钟 m、小时 h、天 d、周 w，可使用加减偏移。"
                code={'{\n  "expires_at": { "$date": "{{now+2h}}" },\n  "updated_at": ISODate("{{now}}"),\n  "start_at": { "$date": "{{now-7d}}" }\n}'}
              />
              <HelpExample
                title="Update 示例"
                description="Filter 用于定位文档，Update 使用 $set 修改字段。执行页勾选某参数的“为空时不更新”后，该参数为空时对应字段会被自动移除。"
                code={'Filter\n{\n  "_id": ObjectId("{{request_id}}")\n}\n\nUpdate\n{\n  "$set": {\n    "title": "{{title}}",\n    "expires_at": { "$date": "{{expiresAt}}" },\n    "updated_at": { "$date": "{{now}}" }\n  }\n}'}
              />
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                每次执行都会重新计算 <code className="font-mono">{'{{now}}'}</code>。动态时间只用于日期值，不要用于 ObjectId。
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpExample({ title, description, code }: { title: string; description: string; code: string }) {
  return (
    <section>
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-slate-500">{description}</p>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 font-mono text-xs leading-5 text-slate-100">{code}</pre>
    </section>
  );
}
