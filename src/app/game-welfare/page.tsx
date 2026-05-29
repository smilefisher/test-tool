'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GAME_OPTIONS = [
  { label: 'A5', name: '墨迹大侠', value: 3 },
  { label: 'T5', name: '向僵尸开炮', value: 4 },
  { label: 'C6', name: '保卫向日葵', value: 5 },
  { label: 'X5', name: '快来当领主', value: 6 },
  { label: 'X3', name: '武侠大明星', value: 7 },
  { label: 'K5', name: '向末日开炮', value: 8 },
  { label: 'X6', name: '冒险之星', value: 9 },
  { label: 'D3', name: '精英防守', value: 10 },
  { label: 'S6', name: '无限轮回', value: 11 },
  { label: 'A7', name: '元气战纪', value: 12 },
  { label: 'D5', name: '楚新钓', value: 13 },
  { label: 'D6', name: '迷你王国', value: 14 },
];

const ENV_OPTIONS = [
  { label: '测试1', value: 'test1' },
  { label: '测试2', value: 'test2' },
];

interface ZoneOption { value: string; desc: string; }
interface ZoneGroup { group: string; zones: ZoneOption[]; }

const ZONE_MAP: Record<number, ZoneGroup[]> = {
  3: [ // A5
    { group: '1大区', zones: [{ value: 'A5_ZONE1', desc: 'Android' }] },
    { group: '2大区', zones: [{ value: 'A5_ZONE2', desc: 'iOS' }] },
    { group: '3大区', zones: [{ value: 'A5_ZONE3', desc: '微小' }, { value: 'A5_ZONE3_PKG', desc: '同服包' }] },
    { group: '4大区', zones: [{ value: 'A5_ZONE4', desc: 'Android' }, { value: 'A5_ZONE4_HDL', desc: '抖音小手柄' }, { value: 'A5_ZONE4_PKG', desc: '同服包' }] },
    { group: '6大区', zones: [{ value: 'A5_ZONE6', desc: '' }, { value: 'A5_ZONE6_PKG', desc: '同服包' }] },
    { group: '11大区', zones: [{ value: 'A5_ZONE11', desc: '抖音' }] },
    { group: '15大区', zones: [{ value: 'A5_ZONE15_EMAIL', desc: 'Taptap' }] },
  ],
  4: [ // T5
    { group: '1大区', zones: [{ value: 'T5_ZONE1', desc: 'Android' }, { value: 'T5_ZONE1_HDL', desc: '抖音小手柄' }] },
    { group: '2大区', zones: [{ value: 'T5_ZONE2', desc: '微信小程序' }] },
    { group: '3大区', zones: [{ value: 'T5_ZONE3', desc: 'iOS' }] },
    { group: '5大区', zones: [{ value: 'T5_ZONE5', desc: '抖音小程序' }, { value: 'T5_ZONE5_EMAIL', desc: '抖音小程序(含极速版/火山版)' }] },
    { group: '6大区', zones: [{ value: 'T5_ZONE6', desc: '华为' }] },
    { group: '7大区', zones: [{ value: 'T5_ZONE7_EMAIL', desc: 'Taptap' }] },
    { group: '8大区', zones: [{ value: 'T5_ZONE8_EMAIL', desc: '手Q' }] },
    { group: '9大区', zones: [{ value: 'T5_ZONE9_EMAIL', desc: '美团/京东' }] },
    { group: '10大区', zones: [{ value: 'T5_ZONE10_EMAIL', desc: '支付宝' }] },
    { group: '11大区', zones: [{ value: 'T5_ZONE11_EMAIL', desc: '350' }] },
    { group: '12大区', zones: [{ value: 'T5_ZONE12_EMAIL', desc: 'VIVO/OPPO/小米/荣耀' }] },
  ],
  5: [ // C6
    { group: '1大区', zones: [{ value: 'C6_ZONE1', desc: 'Android & iOS' }] },
    { group: '3大区', zones: [{ value: 'C6_ZONE3', desc: '微小' }] },
    { group: '4大区', zones: [{ value: 'C6_ZONE4_EMAIL', desc: 'Taptap' }] },
    { group: '5大区', zones: [{ value: 'C6_ZONE5', desc: '抖小' }, { value: 'C6_ZONE5_EEMAIL', desc: '抖小(含极速版/火山版)' }] },
    { group: '6大区', zones: [{ value: 'C6_ZONE6_EMAIL', desc: '华为' }] },
    { group: '7大区', zones: [{ value: 'C6_ZONE7_EMAIL', desc: 'VIVO/OPPO/小米/荣耀' }] },
    { group: '8大区', zones: [{ value: 'C6_ZONE8_EMAIL', desc: '美团' }] },
    { group: '9大区', zones: [{ value: 'C6_ZONE9_EMAIL', desc: '京东' }] },
    { group: '13大区', zones: [{ value: 'C6_ZONE13_EMAIL', desc: '支付宝' }] },
  ],
  6: [ // X5
    { group: '1大区', zones: [{ value: 'X5_ZONE1', desc: 'Android & iOS' }, { value: 'X5_ZONE1_HDL', desc: '抖音小手柄' }, { value: 'X5_ZONE1_EMAIL', desc: 'Taptap' }] },
    { group: '2大区', zones: [{ value: 'X5_ZONE2', desc: '微小' }, { value: 'X5_ZONE2_APP', desc: '微小-转端玩家' }] },
    { group: '3大区', zones: [{ value: 'X5_ZONE3_HW', desc: '华为' }, { value: 'X5_ZONE3_DY', desc: '抖小' }] },
    { group: '14大区', zones: [{ value: 'X5_ZONE14', desc: '支付宝' }] },
  ],
  7: [ // X3
    { group: '1大区', zones: [{ value: 'X3_ZONE1', desc: 'Android' }, { value: 'X3_ZONE1_Taptap', desc: 'Taptap' }, { value: 'X3_ZONE1_HDL', desc: '抖音小手柄' }] },
    { group: '2大区', zones: [{ value: 'X3_ZONE2', desc: 'iOS' }] },
    { group: '3大区', zones: [{ value: 'X3_ZONE3', desc: '微小' }] },
    { group: '5大区', zones: [{ value: 'X3_ZONE5', desc: '抖小' }] },
    { group: '33大区', zones: [{ value: 'X3_ZONE33_EMAIL', desc: '美团' }] },
    { group: '34大区', zones: [{ value: 'X3_ZONE34_EMAIL', desc: '支付宝' }] },
  ],
  8: [{ group: '1大区', zones: [{ value: 'K5_ZONE1', desc: 'Android & iOS' }] }], // K5
  9: [{ group: '1大区', zones: [{ value: 'X6_ZONE1', desc: 'Android & iOS' }] }], // X6
  10: [{ group: '1大区', zones: [{ value: 'D3_ZONE1', desc: 'Android & iOS' }] }], // D3
  11: [ // S6
    { group: '1大区', zones: [{ value: 'S6_ZONE1', desc: 'Android & iOS' }, { value: 'S6_ZONE1_EMAIL', desc: 'Taptap' }] },
    { group: '3大区', zones: [{ value: 'S6_ZONE3', desc: '微小' }] },
    { group: '5大区', zones: [{ value: 'S6_ZONE5', desc: '抖小' }] },
    { group: '6大区', zones: [{ value: 'S6_ZONE6', desc: '华为' }] },
  ],
  12: [ // A7
    { group: '1大区', zones: [{ value: 'A7_ZONE1', desc: 'Android & iOS' }] },
    { group: '3大区', zones: [{ value: 'A7_ZONE3', desc: '微小' }] },
    { group: '5大区', zones: [{ value: 'A7_ZONE5', desc: '抖小' }] },
  ],
  13: [{ group: '1大区', zones: [{ value: 'D5_ZONE1', desc: 'Android & iOS' }] }], // D5
  14: [], // D6
};

const TOKEN_STORAGE_KEY = 'game-welfare-token-id';
const ROLES_STORAGE_KEY = 'game-welfare-saved-roles';

interface ApiToken { id: number; name: string; created_at: string; }
interface RoleInfo {
  platform_uin: string; channel_type: string; role_uin: string; role_id: string;
  role_name: string; level: string; avatar: string; unblock_time: number;
  world_id: string; world_name: string;
}
interface SavedRole { role_id: string; role_name: string; zone: string; world_id: string; world_name: string; }
interface SendResult { error?: string; details?: string; errCode?: number; duration: number; raw: unknown; }

function loadSavedRoles(): Record<string, SavedRole[]> {
  try { return JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '{}'); } catch { return {}; }
}
function storeSavedRoles(data: Record<string, SavedRole[]>) {
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(data));
}

export default function GameWelfarePage() {
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [showTokenMgr, setShowTokenMgr] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [gameId, setGameId] = useState<number>(GAME_OPTIONS[0].value);
  const [env, setEnv] = useState('test1');

  const [zone, setZone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [querying, setQuerying] = useState(false);
  const [queryData, setQueryData] = useState<RoleInfo | null>(null);
  const [queryError, setQueryError] = useState('');

  const [savedRoles, setSavedRoles] = useState<Record<string, SavedRole[]>>({});
  const [selectedSavedRole, setSelectedSavedRole] = useState('');
  const [mailId, setMailId] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    fetchTokens().then(tokens => {
      const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (saved && tokens.some((t: ApiToken) => String(t.id) === saved)) setSelectedTokenId(saved);
    });
    setSavedRoles(loadSavedRoles());
  }, []);

  // 切换游戏时重置 zone 和已选角色
  useEffect(() => {
    setZone('');
    setSelectedSavedRole('');
    setQueryData(null);
    setQueryError('');
  }, [gameId]);

  async function fetchTokens(): Promise<ApiToken[]> {
    const res = await fetch('/api/tokens');
    if (res.ok) { const d = await res.json(); setApiTokens(d); return d; }
    return [];
  }

  function handleSelectToken(id: string) {
    setSelectedTokenId(id);
    if (id) localStorage.setItem(TOKEN_STORAGE_KEY, id);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  async function handleAddToken() {
    if (!newTokenName.trim() || !newTokenValue.trim()) { setTokenError('名称和值不能为空'); return; }
    setTokenError('');
    const res = await fetch('/api/tokens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTokenName.trim(), value: newTokenValue.trim() }),
    });
    if (res.ok) { setNewTokenName(''); setNewTokenValue(''); fetchTokens(); }
    else { const d = await res.json(); setTokenError(d.error || '添加失败'); }
  }

  async function handleDeleteToken(id: number) {
    if (!confirm('确认删除此 Token？')) return;
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' });
    if (selectedTokenId === String(id)) handleSelectToken('');
    fetchTokens();
  }

  async function handleQuery() {
    if (!selectedTokenId) { setQueryError('请先选择 Token'); return; }
    if (!zone) { setQueryError('请选择大区'); return; }
    if (!roleId.trim()) { setQueryError('请输入角色ID'); return; }
    setQuerying(true); setQueryError(''); setQueryData(null);
    try {
      const res = await fetch('/api/game-welfare/get-role', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, zone, role_id: roleId.trim(), token_id: Number(selectedTokenId), env }),
      });
      const data = await res.json();
      if (!res.ok) setQueryError(data.error || '查询失败');
      else setQueryData(data);
    } catch (e) {
      setQueryError(`请求异常: ${e instanceof Error ? e.message : String(e)}`);
    } finally { setQuerying(false); }
  }

  function handleSaveRole() {
    if (!queryData) return;
    const key = String(gameId);
    const next = { ...savedRoles };
    if (!next[key]) next[key] = [];
    if (!next[key].some(r => r.role_id === queryData.role_id)) {
      next[key] = [...next[key], {
        role_id: queryData.role_id, role_name: queryData.role_name,
        zone, world_id: queryData.world_id, world_name: queryData.world_name,
      }];
      setSavedRoles(next); storeSavedRoles(next);
    }
  }

  function handleDeleteSavedRole(rid: string) {
    const key = String(gameId);
    const next = { ...savedRoles, [key]: (savedRoles[key] || []).filter(r => r.role_id !== rid) };
    setSavedRoles(next); storeSavedRoles(next);
    if (selectedSavedRole === rid) setSelectedSavedRole('');
  }

  async function handleSend() {
    if (!selectedTokenId) { setSendError('请先选择 Token'); return; }
    if (!selectedSavedRole || !selectedRole) { setSendError('请选择角色'); return; }
    if (!mailId.trim()) { setSendError('请输入邮件ID'); return; }
    setSending(true); setSendError(''); setSendResult(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/game-welfare/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId, zone: selectedRole.zone, role_id: selectedRole.role_id,
          world_id: selectedRole.world_id, mail_id: mailId.trim(),
          token_id: Number(selectedTokenId), env,
        }),
      });
      const data = await res.json();
      if (!res.ok) setSendResult({ error: data.error, details: data.details, errCode: data.code, duration: Date.now() - start, raw: data });
      else setSendResult({ duration: Date.now() - start, raw: data });
    } catch (e) {
      setSendResult({ error: e instanceof Error ? e.message : String(e), duration: Date.now() - start, raw: null });
    } finally { setSending(false); }
  }

  const currentGame = GAME_OPTIONS.find(g => g.value === gameId)!;
  const currentZoneGroups = ZONE_MAP[gameId] || [];
  const currentGameRoles = savedRoles[String(gameId)] || [];
  const selectedRole = currentGameRoles.find(r => r.role_id === selectedSavedRole);
  const isRoleSaved = queryData ? currentGameRoles.some(r => r.role_id === queryData.role_id) : false;
  const selectedTokenName = apiTokens.find(t => String(t.id) === selectedTokenId)?.name;

  // 当前选中 zone 的描述
  const selectedZoneDesc = currentZoneGroups.flatMap(g => g.zones).find(z => z.value === zone);

  // 按大区分组已保存角色
  function getZoneGroup(zoneValue: string): string {
    for (const g of currentZoneGroups) {
      if (g.zones.some(z => z.value === zoneValue)) return g.group;
    }
    return '未知大区';
  }

  const rolesByZoneGroup = currentGameRoles.reduce((acc, role) => {
    const group = getZoneGroup(role.zone);
    if (!acc[group]) acc[group] = [];
    acc[group].push(role);
    return acc;
  }, {} as Record<string, SavedRole[]>);

  const sortedZoneGroups = Object.keys(rolesByZoneGroup).sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)?.[0] || '999');
    const bNum = parseInt(b.match(/\d+/)?.[0] || '999');
    return aNum - bNum;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-8 0v2m8 0a4 4 0 018 0v2M5 20h14" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-800">游戏福利下发</h1>
          </div>
          <div className="flex items-center gap-2">
            <select value={env} onChange={e => setEnv(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600">
              {ENV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={selectedTokenId} onChange={e => handleSelectToken(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600 max-w-[140px]">
              <option value="">-- Token --</option>
              {apiTokens.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={() => setShowTokenMgr(v => !v)} className={`p-1.5 transition-colors rounded-lg hover:bg-slate-100 ${showTokenMgr ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`} title="管理 Token">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Token 管理 */}
        {showTokenMgr && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">管理 Token</h2>
              {selectedTokenName && <span className="text-xs text-slate-400">当前: <span className="text-blue-600 font-medium">{selectedTokenName}</span></span>}
            </div>
            <div className="p-6 space-y-3">
              {apiTokens.length === 0 && <p className="text-sm text-slate-400">暂无 Token</p>}
              {apiTokens.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    {String(t.id) === selectedTokenId && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
                    <span className="text-sm font-medium text-slate-700">{t.name}</span>
                    <span className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <button onClick={() => handleDeleteToken(t.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input type="text" value={newTokenName} onChange={e => setNewTokenName(e.target.value)} placeholder="Token 名称" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" value={newTokenValue} onChange={e => setNewTokenValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddToken()} placeholder="Token 值" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleAddToken} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">添加</button>
              </div>
              {tokenError && <p className="text-xs text-red-500">{tokenError}</p>}
            </div>
          </section>
        )}

        {/* 游戏选择 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">选择游戏</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {GAME_OPTIONS.map(g => (
                <button key={g.value} onClick={() => setGameId(g.value)}
                  className={`rounded-lg px-3 py-2.5 text-center transition-all border ${gameId === g.value ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'}`}>
                  <p className="text-xs font-bold">{g.label}</p>
                  <p className={`text-[10px] mt-0.5 ${gameId === g.value ? 'text-orange-100' : 'text-slate-400'}`}>{g.name}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-600">{currentGame.label}</span>
              <span className="text-sm text-slate-700">{currentGame.name}</span>
              <span className="text-xs text-slate-400 ml-1">· {currentGameRoles.length} 个已保存角色</span>
            </div>
          </div>
        </section>

        {/* 查询角色信息 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <h2 className="text-base font-semibold text-slate-800">查询角色信息</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">大区 (zone) <span className="text-red-500">*</span></label>
                {currentZoneGroups.length === 0 ? (
                  <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">该游戏暂无大区配置</div>
                ) : (
                  <select value={zone} onChange={e => setZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- 选择大区 --</option>
                    {currentZoneGroups.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.zones.map(z => (
                          <option key={z.value} value={z.value}>
                            {z.desc ? `${z.value} · ${z.desc}` : z.value}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
                {zone && selectedZoneDesc && (
                  <p className="mt-1 text-xs text-slate-400 font-mono">{zone}{selectedZoneDesc.desc ? ` · ${selectedZoneDesc.desc}` : ''}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">角色ID (role_id) <span className="text-red-500">*</span></label>
                <input type="text" value={roleId} onChange={e => setRoleId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuery()} placeholder="输入角色ID" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            {queryError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 font-mono break-all">{queryError}</div>}

            <button onClick={handleQuery} disabled={querying} className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors">
              {querying
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />查询中...</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>查询</>
              }
            </button>

            {queryData && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">角色信息</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />成功</span>
                    <button onClick={handleSaveRole} disabled={isRoleSaved}
                      className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${isRoleSaved ? 'text-slate-400 bg-slate-100 cursor-default' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}>
                      {isRoleSaved ? '已保存' : '+ 保存角色'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                  {[
                    { key: '角色ID', val: queryData.role_id },
                    { key: '角色名', val: queryData.role_name },
                    { key: '等级', val: queryData.level },
                    { key: '平台Uin', val: queryData.platform_uin },
                    { key: '角色Uin', val: queryData.role_uin },
                    { key: '渠道', val: queryData.channel_type },
                    { key: '区服ID', val: queryData.world_id },
                    { key: '区服名', val: queryData.world_name },
                  ].map(({ key, val }) => (
                    <div key={key} className="bg-white rounded-lg p-3 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">{key}</p>
                      <p className="text-sm font-mono text-slate-700 break-all">{val || '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <details className="text-xs">
                    <summary className="text-slate-400 cursor-pointer hover:text-slate-600">查看原始 JSON</summary>
                    <pre className="mt-2 font-mono text-slate-600 bg-white rounded p-3 border border-slate-100 overflow-x-auto">{JSON.stringify(queryData, null, 2)}</pre>
                  </details>
                </div>
              </div>
            )}

            {currentGameRoles.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{currentGame.label} · {currentGame.name} 已保存角色</p>
                </div>
                <div>
                  {sortedZoneGroups.map(group => (
                    <div key={group}>
                      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{group}</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {rolesByZoneGroup[group].map(r => (
                          <div key={r.role_id} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-slate-50">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">{r.role_name || '—'}</span>
                              <span className="text-xs text-slate-400 font-mono shrink-0">{r.role_id}</span>
                              <span className="text-xs text-slate-400 shrink-0">{r.world_name || r.world_id}</span>
                              <span className="text-xs text-slate-300 font-mono shrink-0">{r.zone}</span>
                            </div>
                            <button onClick={() => handleDeleteSavedRole(r.role_id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50 shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 发送奖励 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <h2 className="text-base font-semibold text-slate-800">发送奖励</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">角色 <span className="text-red-500">*</span></label>
                {currentGameRoles.length === 0 ? (
                  <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">暂无已保存角色，请先查询并保存</div>
                ) : (
                  <select value={selectedSavedRole} onChange={e => setSelectedSavedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">-- 选择角色 --</option>
                    {sortedZoneGroups.map(group => (
                      <optgroup key={group} label={group}>
                        {rolesByZoneGroup[group].map(r => (
                          <option key={r.role_id} value={r.role_id}>
                            {r.role_name ? `${r.role_name} (${r.role_id})` : r.role_id} · {r.world_name || r.world_id}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">邮件ID (mail_id) <span className="text-red-500">*</span></label>
                <input type="text" value={mailId} onChange={e => setMailId(e.target.value)} placeholder="输入邮件ID" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            {selectedRole && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span>zone: <span className="font-mono text-slate-700">{selectedRole.zone}</span></span>
                <span>world_id: <span className="font-mono text-slate-700">{selectedRole.world_id}</span></span>
                <span>role_id: <span className="font-mono text-slate-700">{selectedRole.role_id}</span></span>
              </div>
            )}

            {sendError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">{sendError}</div>}

            <button onClick={handleSend} disabled={sending} className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors">
              {sending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />发送中...</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>发送</>
              }
            </button>

            {sendResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">发送结果</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{sendResult.duration}ms</span>
                    {sendResult.error
                      ? <span className="text-xs text-red-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />失败</span>
                      : <span className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />成功</span>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                  {sendResult.error ? (
                    <>
                      {sendResult.errCode != null && (
                        <div className="bg-white rounded-lg p-3 border border-slate-100">
                          <p className="text-xs text-slate-400 mb-1">错误码</p>
                          <p className="text-sm font-mono text-slate-700">{sendResult.errCode}</p>
                        </div>
                      )}
                      {sendResult.details && (
                        <div className="bg-white rounded-lg p-3 border border-slate-100">
                          <p className="text-xs text-slate-400 mb-1">详情</p>
                          <p className="text-sm font-mono text-slate-700 break-all">{sendResult.details}</p>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3 border border-red-100 col-span-full">
                        <p className="text-xs text-slate-400 mb-1">错误信息</p>
                        <p className="text-sm font-mono text-red-600 break-all">{sendResult.error}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-green-100 col-span-full">
                      <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        发送成功
                      </p>
                    </div>
                  )}
                </div>
                {sendResult.raw != null && (
                  <div className="px-4 pb-4">
                    <details className="text-xs">
                      <summary className="text-slate-400 cursor-pointer hover:text-slate-600">查看原始 JSON</summary>
                      <pre className="mt-2 font-mono text-slate-600 bg-white rounded p-3 border border-slate-100 overflow-x-auto">{JSON.stringify(sendResult.raw, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
