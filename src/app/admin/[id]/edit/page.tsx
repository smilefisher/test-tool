'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToolParam, DbType } from '@/lib/types';

interface Step {
  db_type: DbType;
  command: string;
  description: string | null;
  connection_id: number | null;
}

interface ToolWithSteps extends ToolParam {
  steps: Step[];
}

interface Connection {
  id: number;
  name: string;
  db_type: string;
}

const DB_TYPES: { value: DbType; label: string }[] = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'mongodb', label: 'MongoDB' },
];

const PARAM_TYPES = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
];

export default function EditToolPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [paramsList, setParamsList] = useState<ToolParam[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchTool(params.id as string);
      fetchConnections();
    }
  }, [params.id]);

  async function fetchTool(id: string) {
    try {
      const res = await fetch(`/api/tools/${id}`);
      if (!res.ok) throw new Error('Tool not found');
      const data = await res.json();
      setName(data.name);
      setDescription(data.description || '');
      setParamsList(data.params.map((p: ToolParam) => ({
        ...p,
        required: Boolean(p.required),
      })));
      setSteps(data.steps.map((s: Step) => ({
        db_type: s.db_type,
        command: s.command,
        description: s.description,
        connection_id: (s as unknown as { connection_id?: number }).connection_id || null,
      })));
    } catch (error) {
      console.error('Failed to fetch tool:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConnections() {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      setConnections(data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  }

  function addParam() {
    setParamsList([...paramsList, { name: '', label: '', param_type: 'string', default_value: null, required: false }]);
  }

  function removeParam(index: number) {
    setParamsList(paramsList.filter((_, i) => i !== index));
  }

  function updateParam(index: number, field: keyof ToolParam, value: string | boolean | null) {
    const newParams = [...paramsList];
    newParams[index] = { ...newParams[index], [field]: value };
    setParamsList(newParams);
  }

  function addStep() {
    setSteps([...steps, { db_type: 'mysql', command: '', description: null, connection_id: null }]);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function updateStep(index: number, field: keyof Step, value: string | number | null) {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
      return;
    }
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入工具名称');
      return;
    }
    if (steps.length === 0) {
      alert('请至少添加一个执行步骤');
      return;
    }

    const incompleteParams = paramsList.filter(p => p.name.trim() || p.label.trim())
      .filter(p => !p.name.trim() || !p.label.trim());
    if (incompleteParams.length > 0) {
      alert('参数填写不完整：请确保每个参数的名称和标签都已填写');
      return;
    }

    setSaving(true);
    try {
      const validParams = paramsList.filter(p => p.name.trim() && p.label.trim());
      const validSteps = steps.filter(s => s.command.trim());
      const res = await fetch(`/api/tools/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          params: validParams,
          steps: validSteps,
        }),
      });
      if (res.ok) {
        router.push(`/tool/${params.id}`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Failed to update tool:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  }

  function getConnectionsByType(dbType: string) {
    return connections.filter(c => c.db_type === dbType);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">编辑工具</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">工具名称 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">参数配置</h2>
              <button
                type="button"
                onClick={addParam}
                className="px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加参数
              </button>
            </div>

            {paramsList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">暂无参数，点击上方按钮添加</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-3">参数名</th>
                      <th className="pb-3 pr-3">标签</th>
                      <th className="pb-3 pr-3">类型</th>
                      <th className="pb-3 pr-3">默认值</th>
                      <th className="pb-3 pr-3">必填</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paramsList.map((param, index) => (
                      <tr key={index}>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => updateParam(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={param.label}
                            onChange={(e) => updateParam(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={param.param_type}
                            onChange={(e) => updateParam(index, 'param_type', e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            {PARAM_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={param.default_value || ''}
                            onChange={(e) => updateParam(index, 'default_value', e.target.value || null)}
                            placeholder="无"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParam(index, 'required', e.target.checked)}
                            className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => removeParam(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">执行步骤</h2>
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加步骤
              </button>
            </div>

            {steps.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">暂无步骤，点击上方按钮添加</p>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const typeConnections = getConnectionsByType(step.db_type);
                  return (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <select
                          value={step.db_type}
                          onChange={(e) => updateStep(index, 'db_type', e.target.value)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                        >
                          {DB_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {typeConnections.length > 0 && (
                          <select
                            value={step.connection_id || ''}
                            onChange={(e) => updateStep(index, 'connection_id', e.target.value ? parseInt(e.target.value) : null)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">默认连接</option>
                            {typeConnections.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          value={step.description || ''}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                          placeholder="步骤说明（可选）"
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={step.command}
                        onChange={(e) => {
                          updateStep(index, 'command', e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                        }}
                        rows={2}
                        style={{ minHeight: '60px', height: 'auto', maxHeight: '200px' }}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm font-mono resize-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
