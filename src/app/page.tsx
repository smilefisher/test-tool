'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tool } from '@/lib/types';

const DB_COLORS: Record<string, string> = {
  redis: 'bg-red-100 text-red-700',
  mysql: 'bg-blue-100 text-blue-700',
  mongodb: 'bg-green-100 text-green-700',
};

const ICON_CONFIGS = [
  { bg: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/30', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { bg: 'from-red-500 to-red-600', shadow: 'shadow-red-500/30', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { bg: 'from-green-500 to-green-600', shadow: 'shadow-green-500/30', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { bg: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2' },
  { bg: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/30', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { bg: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/30', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { bg: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/30', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { bg: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/30', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
];

function getIconConfig(id: number) {
  return ICON_CONFIGS[id % ICON_CONFIGS.length];
}

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTools();
    loadFavorites();
  }, []);

  async function fetchTools() {
    try {
      const res = await fetch('/api/tools');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTools(data);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadFavorites() {
    const stored = localStorage.getItem('tool-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }

  function toggleFavorite(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    let newFavorites: number[];
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(f => f !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    setFavorites(newFavorites);
    localStorage.setItem('tool-favorites', JSON.stringify(newFavorites));
  }

  const displayedTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(t.id).includes(searchQuery);
    const matchesTab = activeTab === 'all' || favorites.includes(t.id);
    return matchesSearch && matchesTab;
  });

  const favoriteCount = tools.filter(t => favorites.includes(t.id)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-800">测试辅助工具</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/game-welfare"
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
            >
              游戏福利下发
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              管理工具
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具名称..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部工具 <span className="ml-1 opacity-70">{tools.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'favorites'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            ★ 我的收藏 <span className="ml-1 opacity-70">{favoriteCount}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayedTools.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              {searchQuery ? '未找到匹配的工具' : (activeTab === 'favorites' ? '暂无收藏' : '暂无工具')}
            </h3>
            <p className="text-sm text-slate-500">
              {searchQuery ? '尝试其他关键词' : (activeTab === 'favorites' ? '点击工具卡片上的星标即可收藏' : '点击右上角"管理工具"创建第一个工具')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTools.map((tool, index) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 hover:border-blue-300 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <Link
                  href={`/tool/${tool.id}`}
                  className="block p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const icon = getIconConfig(tool.id);
                      return (
                        <div className={`w-12 h-12 bg-gradient-to-br ${icon.bg} rounded-lg flex items-center justify-center shadow-md ${icon.shadow} flex-shrink-0`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.icon} />
                          </svg>
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        #{tool.id} · {new Date(tool.updated_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <p className="relative text-sm text-slate-500 line-clamp-2 mb-4 font-mono text-[13px]">
                    {tool.description || '// no description'}
                  </p>

                  <div className="relative flex items-center gap-2 pt-4 border-t border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-slate-400 font-medium">READY</span>
                  </div>
                </Link>
                <button
                  onClick={(e) => toggleFavorite(tool.id, e)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all z-10 ${
                    favorites.includes(tool.id)
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-slate-300 hover:text-yellow-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
