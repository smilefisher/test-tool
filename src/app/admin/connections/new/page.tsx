'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DbType = 'redis' | 'mysql' | 'mongodb';

const DB_TYPES: { value: DbType; label: string }[] = [
  { value: 'redis', label: 'Redis' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mongodb', label: 'MongoDB' },
];

export default function NewConnectionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [dbType, setDbType] = useState<DbType>('redis');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('6379');
  const [db, setDb] = useState('0');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [uri, setUri] = useState('');

  function handleDbTypeChange(value: DbType) {
    setDbType(value);
    if (value === 'redis') setPort('6379');
    else if (value === 'mysql') setPort('3306');
    else setPort('27017');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入连接名称');
      return;
    }

    setSaving(true);
    try {
      const data: Record<string, string | number | null> = {
        name,
        db_type: dbType,
        host: host || null,
        port: port ? parseInt(port) : null,
        db: dbType === 'redis' && db ? parseInt(db) : null,
        username: dbType === 'redis' ? null : (username || null),
        password: dbType === 'mongodb' ? null : (password || null),
        database_name: databaseName || null,
        uri: uri || null,
      };

      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/connections');
      } else {
        throw new Error('Failed to create');
      }
    } catch (error) {
      console.error('Failed to create connection:', error);
      alert('创建失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/admin/connections" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">新建数据库连接</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">连接名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：本地 Redis"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">数据库类型 *</label>
              <div className="flex gap-3">
                {DB_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleDbTypeChange(t.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      dbType === t.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {dbType === 'mongodb' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MongoDB URI</label>
                <input
                  type="text"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                  placeholder="mongodb://localhost:27017"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-slate-400">使用 URI 可以一次性配置连接信息</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">主机</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="localhost"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">端口</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder={dbType === 'redis' ? '6379' : '3306'}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {dbType === 'redis' && (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">数据库编号</label>
                      <input
                        type="number"
                        value={db}
                        onChange={(e) => setDb(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-slate-400">Redis 数据库编号，默认为 0</p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="无密码"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {dbType === 'mysql' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">数据库名</label>
                      <input
                        type="text"
                        value={databaseName}
                        onChange={(e) => setDatabaseName(e.target.value)}
                        placeholder="test"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="root"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Link
              href="/admin/connections"
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
