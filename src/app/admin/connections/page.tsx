'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Connection {
  id: number;
  name: string;
  db_type: 'redis' | 'mysql' | 'mongodb';
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
  database_name: string | null;
  uri: string | null;
  created_at: string;
  updated_at: string;
}

const DB_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  redis: { bg: 'bg-red-100', text: 'text-red-700' },
  mysql: { bg: 'bg-blue-100', text: 'text-blue-700' },
  mongodb: { bg: 'bg-green-100', text: 'text-green-700' },
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      setConnections(data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定要删除这个数据库连接吗？')) return;
    try {
      await fetch(`/api/connections/${id}`, { method: 'DELETE' });
      setConnections(connections.filter(c => c.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  }

  function getConnectionInfo(conn: Connection): string {
    switch (conn.db_type) {
      case 'redis':
        return `${conn.host}:${conn.port || 6379}`;
      case 'mysql':
        return `${conn.host}:${conn.port || 3306}/${conn.database_name || ''}`;
      case 'mongodb':
        return conn.uri || `${conn.host}/${conn.database_name || ''}`;
      default:
        return '';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-slate-600 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-slate-800">数据库连接</h1>
            </div>
            <Link
              href="/admin/connections/new"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建连接
            </Link>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/admin" className="text-slate-500 hover:text-slate-700">工具管理</Link>
            <Link href="/admin/connections" className="text-blue-600 font-medium">数据库连接</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">暂无数据库连接</h3>
            <p className="text-sm text-slate-500 mb-4">点击右上角按钮添加数据库连接</p>
            <Link
              href="/admin/connections/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建连接
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((conn) => {
              const dbStyle = DB_TYPE_COLORS[conn.db_type] || DB_TYPE_COLORS.mysql;
              return (
                <div key={conn.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dbStyle.bg}`}>
                        <svg className={`w-5 h-5 ${dbStyle.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{conn.name}</h3>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${dbStyle.bg} ${dbStyle.text}`}>
                          {conn.db_type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/connections/${conn.id}/edit`}
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteId(conn.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 font-mono bg-slate-50 rounded-lg p-3 break-all">
                    {getConnectionInfo(conn)}
                  </div>
                  <div className="mt-4 text-xs text-slate-400">
                    更新于 {new Date(conn.updated_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 mb-6">确定要删除这个数据库连接吗？此操作不可撤销。</p>
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
