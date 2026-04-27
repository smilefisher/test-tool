'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToolWithDetails, ExecuteResult } from '@/lib/types';

const DB_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  redis: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  mysql: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  mongodb: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
};

export default function ToolDetail() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<ToolWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<ExecuteResult[]>([]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showSteps, setShowSteps] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTool(params.id as string);
    }
  }, [params.id]);

  async function fetchTool(id: string) {
    try {
      const res = await fetch(`/api/tools/${id}`);
      if (!res.ok) throw new Error('Tool not found');
      const data = await res.json();
      setTool(data);

      const initialValues: Record<string, string> = {};
      data.params.forEach((p: { name: string; default_value: string | null }) => {
        initialValues[p.name] = p.default_value || '';
      });
      setParamValues(initialValues);
    } catch (err) {
      setError('工具不存在');
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (!tool) return;

    const missingParams = tool.params
      .filter(p => p.required)
      .filter(p => {
        const value = paramValues[p.name];
        return value === undefined || value === null || value === '';
      })
      .map(p => p.label);

    if (missingParams.length > 0) {
      setError(`缺少必填参数: ${missingParams.join(', ')}`);
      return;
    }

    setExecuting(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch(`/api/tools/${tool.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: paramValues }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '执行失败');
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError('执行失败');
    } finally {
      setExecuting(false);
    }
  }

  function replaceParams(template: string): string {
    let result = template;
    for (const [key, value] of Object.entries(paramValues)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || `<${key}>`);
    }
    return result;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">工具不存在</h2>
          <Link href="/" className="text-blue-500 hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </Link>
          <Link
            href={`/admin/${tool.id}/edit`}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            编辑
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2 break-words">{tool.name}</h1>
          <p className="text-slate-500">{tool.description || '暂无描述'}</p>
        </div>

        {tool.params.length > 0 ? (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">参数</h2>
            <div className="space-y-4">
              {tool.params.map((param) => (
                <div key={param.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {param.label}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={param.param_type === 'number' ? 'number' : 'text'}
                    value={paramValues[param.name] || ''}
                    onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                    placeholder={`输入 ${param.label}`}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </section>
        ) : tool.steps.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <p className="text-amber-700">此工具没有定义参数，请联系管理员添加参数。</p>
          </div>
        ) : null}

        {tool.steps.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-lg font-semibold text-slate-800">执行步骤</h2>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${showSteps ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSteps && (
              <div className="mt-4 space-y-3">
                {tool.steps.map((step, index) => {
                  const dbStyle = DB_COLORS[step.db_type] || DB_COLORS.mysql;
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border ${dbStyle.bg} ${dbStyle.border}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </span>
                        <span className={`text-sm font-medium uppercase ${dbStyle.text}`}>
                          {step.db_type}
                        </span>
                        {step.description && (
                          <span className="text-sm text-slate-500">- {step.description}</span>
                        )}
                      </div>
                      <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap break-all">
                        {replaceParams(step.command)}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <button
          onClick={handleExecute}
          disabled={executing}
          className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {executing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              执行中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              执行
            </>
          )}
        </button>

        {results.length > 0 && (
          <section className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">执行结果</h2>
            <div className="space-y-3">
              {results.map((result, index) => {
                const dbStyle = DB_COLORS[result.dbType] || DB_COLORS.mysql;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-slate-600">
                        步骤 {result.stepIndex + 1}
                      </span>
                      <span className={`text-xs font-medium uppercase ${dbStyle.text}`}>
                        {result.dbType}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">{result.duration}ms</span>
                    </div>
                    <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap break-all mb-2">
                      {result.command}
                    </pre>
                    {result.error && (
                      <p className="text-sm text-red-600">错误: {result.error}</p>
                    )}
                    {result.result !== undefined && (
                      <div className="mt-2">
                        <p className="text-sm text-slate-600 mb-1">结果:</p>
                        <pre className="text-sm font-mono text-slate-700 bg-slate-100 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
