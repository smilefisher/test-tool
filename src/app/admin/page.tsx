'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tool } from '@/lib/types';

export default function AdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      setTools(data);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这个工具吗？')) return;
    try {
      await fetch(`/api/tools/${id}`, { method: 'DELETE' });
      setTools(tools.filter(t => t.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete tool:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-slate-800">管理后台</h1>
            </div>
            <Link
              href="/admin/new"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建工具
            </Link>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/admin" className="text-blue-600 font-medium">工具管理</Link>
            <Link href="/admin/connections" className="text-slate-500 hover:text-slate-700">数据库连接</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">暂无工具</h3>
            <p className="text-sm text-slate-500 mb-4">点击右上角按钮创建第一个工具</p>
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建工具
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">工具名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">描述</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">更新时间</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/tool/${tool.id}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                        {tool.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {tool.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(tool.updated_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/tool/${tool.id}`}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title="执行"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/${tool.id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title="编辑"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteId(tool.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 mb-6">确定要删除这个工具吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
