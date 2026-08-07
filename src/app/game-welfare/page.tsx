'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const GAME_OPTIONS = [
  { label: 'A5', name: '墨迹大侠', value: 3 },
  { label: 'T5', name: '向僵尸开炮', value: 4 },
  { label: 'C6', name: '保卫向日葵', value: 5 },
  { label: 'X5', name: '快来当领主', value: 6 },
  { label: 'X3', name: '武侠大明星', value: 7 },
  { label: 'K5', name: '向末日开炮', value: 8 },
  { label: 'X6', name: '冒险之星', value: 9 },
  { label: 'S6', name: '无限轮回', value: 11 },
  { label: 'A7', name: '元气战纪', value: 12 },
  { label: 'D5', name: '楚新钓', value: 13 },
  { label: 'A10', name: '俱乐大玩家', value: 15 },
  { label: 'A9', name: '朋友别眨眼', value: 17 },
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
  11:[ // S6
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
  13: [ // D5
    { group: '1大区', zones: [{ value: 'D5_ZONE1', desc: 'Android & iOS' }] },
    { group: '3大区', zones: [{ value: 'D5_ZONE3', desc: '微小' }] },
    { group: '4大区', zones: [{ value: 'D5_ZONE4', desc: '抖小' }] },
    { group: '5大区', zones: [{ value: 'D5_ZONE5_EMAIL', desc: '快小' }] },
    { group: '13大区', zones: [{ value: 'D5_ZONE13_EMAIL', desc: '支付宝' }] },
    { group: '20大区', zones: [{ value: 'D5_ZONE20_EMAIL', desc: '350' }] },
  ],
  15: [ // A10
    { group: '1大区', zones: [{ value: 'A10_ZONE1', desc: 'Android' }] },
    { group: '2大区', zones: [{ value: 'A10_ZONE2_iOS', desc: 'iOS' }, { value: 'A10_ZONE2_WX', desc: '微小' }, { value: 'A10_ZONE2_DY', desc: '抖小' }] },
  ],
  17: [ // A9
    { group: '1大区', zones: [{ value: 'A9_ZONE1', desc: 'Android & iOS' }] },
  ],
};

const ROLES_STORAGE_KEY = 'game-welfare-saved-roles';

// 测试服固定Token
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjg4OCwicGhvbmUiOiIiLCJvcGVuX2lkIjoiIiwidW5pb25faWQiOiIiLCJleHAiOjE5Mzg1MTgxNzAsImlzcyI6ImdvLWdhcHAifQ.DgygFwt_56_ltBtx_TeyIJy7d7pUuJPj8oJQzcPmYyU';
interface RoleInfo {
  platform_uin: string; channel_type: string; role_uin: string; role_id: string;
  role_name: string; level: string; avatar: string; unblock_time: number;
  world_id: string; world_name: string;
}
interface SavedRole { role_id: string; role_name: string; zone: string; world_id: string; world_name: string; }
interface SendResult { error?: string; details?: string; errCode?: number; duration: number; raw: unknown; }
interface EmailRecord {
  id: number; game_id: number; game_label: string; zone: string; role_id: string; role_name: string;
  world_id: string; world_name: string; mail_id: string; env: string; success: boolean;
  error_msg: string | null; created_at: string;
}

function loadSavedRoles(): Record<string, SavedRole[]> {
  try { return JSON.parse(localStorage.getItem(ROLES_STORAGE_KEY) || '{}'); } catch { return {}; }
}
function storeSavedRoles(data: Record<string, SavedRole[]>) {
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(data));
}

export default function GameWelfarePage() {
  const [gameId, setGameId] = useState<number>(GAME_OPTIONS[0].value);
  const [env, setEnv] = useState('test1');

  const [zone, setZone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [querying, setQuerying] = useState(false);
  const [queryData, setQueryData] = useState<RoleInfo | null>(null);
  const [queryError, setQueryError] = useState('');

  const [savedRoles, setSavedRoles] = useState<Record<string, SavedRole[]>>({});
  const [selectedSavedRoles, setSelectedSavedRoles] = useState<Set<string>>(new Set());
  const [mailId, setMailId] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<Map<string, SendResult>>(new Map());
  const [sendError, setSendError] = useState('');

  const [records, setRecords] = useState<EmailRecord[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsTodayOnly, setRecordsTodayOnly] = useState(true);
  const [recordsRoleFilter, setRecordsRoleFilter] = useState('');
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showSavedRoles, setShowSavedRoles] = useState(false);
  const [serverInfoMap, setServerInfoMap] = useState<Record<number, { server_id: string; avatar: string }>>({});
  interface GiftInfo { content: string; icon: string; quantity: number; }
  interface VideoGiftItem {
    mail_id: string; index: number;
    gifts: GiftInfo[];
    currentGifts: GiftInfo[];
    currentMailId: string;
    backupGifts: GiftInfo[];
    backupMailId: string;
    useBackup: boolean;
  }
  const [videoGiftConfigs, setVideoGiftConfigs] = useState<VideoGiftItem[]>([]);
  const [useVideoGift, setUseVideoGift] = useState(false);
  const [selectedVideoGiftIndices, setSelectedVideoGiftIndices] = useState<Set<number>>(new Set());
  interface CumulativeItem { day: number; value: string; icon: string; name: string; description: string; num_desc: string; extraGifts: GiftInfo[]; }
  const [cumulativeConfigs, setCumulativeConfigs] = useState<CumulativeItem[]>([]);
  const [useCumulative, setUseCumulative] = useState(false);
  const [selectedCumulativeIndices, setSelectedCumulativeIndices] = useState<Set<number>>(new Set());
  interface WheelLotteryInfo { id: string; lottery_name: string; start_time: string; end_time: string; has_cumulative_prize: boolean; }
  const [wheelLotteries, setWheelLotteries] = useState<WheelLotteryInfo[]>([]);
  const [wheelLotteryPage, setWheelLotteryPage] = useState(1);
  const [wheelLotteryHasMore, setWheelLotteryHasMore] = useState(false);
  interface WheelPrizeItem { id: string; name: string; icon: string; num: number; prop_id: string; section: 'prize' | 'cumulative'; times?: number; guide_text?: string; canSend: boolean; }

// gRPC 响应类型 (protoLoader: longs=String, keepCase=true, defaults=true)
interface GiftDescResponse { icon: string; content: string; quantity: number; }
interface VideoGiftConfigResponse {
  id: string; index: number; server_id: string; sort_order: number;
  current_gifts: GiftDescResponse[]; current_mail_id: string; current_start_time: string;
  backup_type: number; backup_gifts: GiftDescResponse[]; backup_mail_id: string;
  backup_start_time: string; backup_end_time: string;
}
interface ExtraGiftResponse { type: number; content: string; icon: string; prop_id: string; quantity: string; expiration: string; num_desc: string; }
interface CumulativeConfigResponse {
  day: number; type: number; value: string; icon: string; description: string;
  num_desc: string; id: string; server_id: string; status: number; name: string;
  extra_gifts: ExtraGiftResponse[];
}
interface WheelLotteryResponse {
  id: string; circle_id: string; lottery_name: string; single_demand_coin: number;
  need_bind_role: boolean; background: string; logo: string; start_time: string; end_time: string;
  rule: string; status: boolean; lottery_type: number; has_cumulative_prize: boolean;
}
interface WheelLotteryPrizeResponse { id: string; lottery_id: string; name: string; icon: string; num: number; total: number; percent: number; prize_type: number; prop_id: string; }
interface WheelLotteryCumulativePrizeResponse { id: string; lottery_id: string; times: number; guide_text: string; name: string; icon: string; num: number; total: number; prize_type: number; prop_id: string; status: number; }
  const [wheelPrizes, setWheelPrizes] = useState<WheelPrizeItem[]>([]);
  const [selectedLotteryId, setSelectedLotteryId] = useState('');
  const [useWheelLottery, setUseWheelLottery] = useState(false);
  const [selectedWheelPrizeIndices, setSelectedWheelPrizeIndices] = useState<Set<number>>(new Set());
  const [wheelDropdownOpen, setWheelDropdownOpen] = useState(false);
  const wheelDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wheelDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (wheelDropdownRef.current && !wheelDropdownRef.current.contains(e.target as Node)) {
        setWheelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [wheelDropdownOpen]);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setSavedRoles(loadSavedRoles());
    fetchRecords(1, true, '', GAME_OPTIONS[0].value);
    fetchAllServerInfo();
  }, []);

  async function fetchAllServerInfo() {
    const results = await Promise.allSettled(
      GAME_OPTIONS.map(async (g) => {
        const res = await fetch('/api/game-welfare/server-info', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
          body: JSON.stringify({ game_type: g.value, env }),
        });
        if (!res.ok) throw new Error();
        return { gameType: g.value, data: await res.json() };
      })
    );
    const map: Record<number, { server_id: string; avatar: string }> = {};
    for (const r of results) {
      if (r.status === 'fulfilled') {
        map[r.value.gameType] = r.value.data;
      }
    }
    setServerInfoMap(map);
    // 初始游戏加载观影有礼和天天领福利
    const firstInfo = map[GAME_OPTIONS[0].value];
    if (firstInfo) {
      fetchVideoGift(firstInfo.server_id);
      fetchCumulativeConfigs(firstInfo.server_id);
      fetchWheelLotteryList(firstInfo.server_id);
    }
  }

  async function fetchVideoGift(serverId: string) {
    try {
      const res = await fetch('/api/game-welfare/video-gift', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({ server_id: serverId, env }),
      });
      if (res.ok) {
        const data = await res.json();
        const now = Date.now() / 1000;
        const parseGifts = (gifts: GiftDescResponse[]): GiftInfo[] =>
          (gifts || []).map(g => ({
            content: String(g.content || ''),
            icon: String(g.icon || ''),
            quantity: Number(g.quantity || 0),
          }));
        const configs = (data.configs as VideoGiftConfigResponse[] || []).map((c) => {
          const backupType = Number(c.backup_type || 0);
          const backupStart = Number(c.backup_start_time || 0);
          const backupEnd = Number(c.backup_end_time || 0);
          let useBackup = false;
          if (backupType === 1) {
            useBackup = now > backupStart && now < backupEnd;
          } else if (backupType === 2) {
            useBackup = now > backupStart;
          }
          const currentGifts = parseGifts(c.current_gifts);
          const backupGifts = parseGifts(c.backup_gifts);
          const gifts = useBackup && backupGifts.length > 0 ? backupGifts : currentGifts;
          const mailId = String(useBackup && c.backup_mail_id ? c.backup_mail_id : (c.current_mail_id || ''));
          return {
            mail_id: mailId,
            index: Number(c.index),
            gifts,
            currentGifts,
            currentMailId: String(c.current_mail_id || ''),
            backupGifts,
            backupMailId: String(c.backup_mail_id || ''),
            useBackup,
          };
        }).filter((c: { mail_id: string }) => c.mail_id);
        setVideoGiftConfigs(configs);
        if (configs.length === 0) {
          setUseVideoGift(false);
          setSelectedVideoGiftIndices(new Set());
        }
      } else {
        setVideoGiftConfigs([]);
      }
    } catch {
      setVideoGiftConfigs([]);
    }
  }

  async function fetchCumulativeConfigs(serverId: string) {
    try {
      const res = await fetch('/api/game-welfare/cumulative-configs', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({ server_id: serverId, page: 1, page_size: 50, env }),
      });
      if (res.ok) {
        const data = await res.json();
        const items = ((data.list || []) as CumulativeConfigResponse[]).map((c) => ({
          day: Number(c.day),
          value: String(c.value || ''),
          icon: String(c.icon || ''),
          name: String(c.name || ''),
          description: String(c.description || ''),
          num_desc: String(c.num_desc || ''),
          extraGifts: (c.extra_gifts || []).map(g => ({
            content: String(g.content || ''),
            icon: String(g.icon || ''),
            quantity: Number(g.quantity || 0),
          })),
        })).filter((c: CumulativeItem) => c.value);
        setCumulativeConfigs(items);
        if (items.length === 0) {
          setUseCumulative(false);
          setSelectedCumulativeIndices(new Set());
        }
      } else {
        setCumulativeConfigs([]);
      }
    } catch {
      setCumulativeConfigs([]);
    }
  }

  const WHEEL_LOTTERY_PAGE_SIZE = 5;

  async function fetchWheelLotteryList(serverId: string, page = 1, resetSelection = false) {
    try {
      const res = await fetch('/api/game-welfare/wheel-lottery-list', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({ circle_id: serverId, effect_status: true, page, page_size: WHEEL_LOTTERY_PAGE_SIZE, env }),
      });
      if (res.ok) {
        const data = await res.json();
        const items = ((data.list || []) as WheelLotteryResponse[]).map((l) => ({
          id: String(l.id || ''),
          lottery_name: String(l.lottery_name || ''),
          start_time: String(l.start_time || ''),
          end_time: String(l.end_time || ''),
          has_cumulative_prize: Boolean(l.has_cumulative_prize),
        }));
        setWheelLotteries(items);
        setWheelLotteryHasMore(items.length === WHEEL_LOTTERY_PAGE_SIZE);
        if (items.length > 0 && (resetSelection || (!selectedLotteryId && page === 1))) {
          setSelectedLotteryId(items[0].id);
          fetchWheelLotteryPrizes(items[0].id);
        }
      }
    } catch { setWheelLotteries([]); }
  }

  async function fetchWheelLotteryPrizes(lotteryId: string) {
    try {
      const [prizesRes, cumulativeRes] = await Promise.all([
        fetch('/api/game-welfare/wheel-lottery-prizes', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
          body: JSON.stringify({ wheel_lottery_id: lotteryId, env }),
        }),
        fetch('/api/game-welfare/wheel-lottery-cumulative-prizes', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
          body: JSON.stringify({ wheel_lottery_id: lotteryId, env }),
        }),
      ]);
      const prizes = prizesRes.ok ? (await prizesRes.json()).list || [] : [];
      const cumulative = cumulativeRes.ok ? (await cumulativeRes.json()).list || [] : [];
      const all: WheelPrizeItem[] = [
        ...(prizes as WheelLotteryPrizeResponse[]).map((p): WheelPrizeItem => ({
          id: String(p.id || ''), name: String(p.name || ''), icon: String(p.icon || ''),
          num: Number(p.num || 0), prop_id: String(p.prop_id || ''), section: 'prize',
          canSend: Number(p.prize_type) === 1,
        })),
        ...(cumulative as WheelLotteryCumulativePrizeResponse[]).map((p): WheelPrizeItem => ({
          id: String(p.id || ''), name: String(p.name || ''), icon: String(p.icon || ''),
          num: Number(p.num || 0), prop_id: String(p.prop_id || ''), section: 'cumulative',
          times: Number(p.times || 0), guide_text: String(p.guide_text || ''),
          canSend: Number(p.prize_type) === 1,
        })),
      ];
      setWheelPrizes(all);
      setSelectedWheelPrizeIndices(new Set());
    } catch { setWheelPrizes([]); }
  }

  async function fetchRecords(page: number, todayOnly: boolean, roleFilter: string, gid = gameId) {
    setRecordsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        todayOnly: String(todayOnly),
        game_id: String(gid),
      });
      if (roleFilter.trim()) params.set('role_id', roleFilter.trim());
      const res = await fetch(`/api/game-welfare/email-records?${params}`);
      if (res.ok) {
        const d = await res.json();
        setRecords(d.records);
        setRecordsTotal(d.total);
      }
    } finally {
      setRecordsLoading(false);
    }
  }

  // 切换游戏时重置 zone 和已选角色
  useEffect(() => {
    setZone('');
    setSelectedSavedRoles(new Set());
    setShowSavedRoles(false);
    setQueryData(null);
    setQueryError('');
    setRecordsPage(1);
    setRecordsRoleFilter('');
    setUseVideoGift(false);
    setSelectedVideoGiftIndices(new Set());
    setUseCumulative(false);
    setSelectedCumulativeIndices(new Set());
    setUseWheelLottery(false);
    setSelectedWheelPrizeIndices(new Set());
    setSelectedLotteryId('');
    setWheelPrizes([]);
    setWheelLotteryPage(1);
    setWheelDropdownOpen(false);
    setMailId('');
    fetchRecords(1, recordsTodayOnly, '', gameId);
    const info = serverInfoMap[gameId];
    if (info) {
      fetchVideoGift(info.server_id);
      fetchCumulativeConfigs(info.server_id);
      fetchWheelLotteryList(info.server_id);
    }
  }, [gameId]);

  async function handleQuery() {
    if (!zone) { setQueryError('请选择大区'); return; }
    if (!roleId.trim()) { setQueryError('请输入角色ID'); return; }
    setQuerying(true); setQueryError(''); setQueryData(null);
    try {
      const res = await fetch('/api/game-welfare/get-role', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: JSON.stringify({ game_id: gameId, zone, role_id: roleId.trim(), env }),
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
    setSelectedSavedRoles(prev => { const next = new Set(prev); next.delete(rid); return next; });
  }

  async function handleSend() {
    if (selectedSavedRoles.size === 0) { setSendError('请选择角色'); return; }
    const mailIds = useWheelLottery
      ? [...selectedWheelPrizeIndices].map(i => wheelPrizes[i].prop_id)
      : useCumulative
      ? [...selectedCumulativeIndices].map(i => cumulativeConfigs[i].value)
      : useVideoGift
      ? [...selectedVideoGiftIndices].map(i => videoGiftConfigs[i].mail_id)
      : mailId.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (mailIds.length === 0) { setSendError('请选择或输入邮件ID'); return; }
    setSending(true); setSendError(''); setSendResults(new Map());
    const sendOne = async ({ role, mail_id }: { role: SavedRole; mail_id: string }): Promise<[string, SendResult]> => {
      const t0 = Date.now();
      try {
        const res = await fetch('/api/game-welfare/send-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` },
          body: JSON.stringify({
            game_id: gameId, zone: role.zone, role_id: role.role_id,
            world_id: role.world_id, mail_id, env,
            game_label: currentGame.label,
            role_name: role.role_name,
            world_name: role.world_name,
          }),
        });
        const data = await res.json();
        if (!res.ok) return [role.role_id + '|' + mail_id, { error: data.error, details: data.details, errCode: data.code, duration: Date.now() - t0, raw: data }];
        return [role.role_id + '|' + mail_id, { duration: Date.now() - t0, raw: data }];
      } catch (e) {
        return [role.role_id + '|' + mail_id, { error: e instanceof Error ? e.message : String(e), duration: Date.now() - t0, raw: null }];
      }
    };
    const entries: [string, SendResult][] = [];
    const sendRole = async (role: SavedRole, mIds: string[]) => {
      for (let i = 0; i < mIds.length; i++) {
        const entry = await sendOne({ role, mail_id: mIds[i] });
        entries.push(entry);
        if (mIds.length > 1 && i < mIds.length - 1) {
          await new Promise(r => setTimeout(r, 100));
        }
      }
    };
    const roles = currentGameRoles.filter(r => selectedSavedRoles.has(r.role_id));
    await Promise.all(roles.map(r => sendRole(r, mailIds)));
    setSendResults(new Map(entries));
    setSending(false);
    fetchRecords(1, recordsTodayOnly, recordsRoleFilter, gameId);
    setRecordsPage(1);
  }

  const currentGame = GAME_OPTIONS.find(g => g.value === gameId)!;
  const currentZoneGroups = ZONE_MAP[gameId] || [];
  const currentGameRoles = savedRoles[String(gameId)] || [];
  const selectedRoles = currentGameRoles.filter(r => selectedSavedRoles.has(r.role_id));
  const isRoleSaved = queryData ? currentGameRoles.some(r => r.role_id === queryData.role_id) : false;

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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* 游戏选择 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">选择游戏</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {GAME_OPTIONS.map(g => {
                const info = serverInfoMap[g.value];
                return (
                  <button key={g.value} onClick={() => setGameId(g.value)}
                    className={`rounded-lg px-3 py-2.5 text-center transition-all border ${gameId === g.value ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'}`}>
                    {info?.avatar && (
                      <img src={info.avatar} alt="" className="w-7 h-7 rounded-full mx-auto mb-1 object-cover" />
                    )}
                    <p className="text-xs font-bold">{g.label}</p>
                    <p className={`text-[10px] mt-0.5 ${gameId === g.value ? 'text-orange-100' : 'text-slate-400'}`}>{g.name}</p>
                  </button>
                );
              })}
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
                <button
                  onClick={() => setShowSavedRoles(v => !v)}
                  className="w-full px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {currentGame.label} · {currentGame.name} 已保存角色 ({currentGameRoles.length})
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${showSavedRoles ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSavedRoles && (
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
                )}
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">角色 <span className="text-red-500">*</span></label>
              {currentGameRoles.length === 0 ? (
                <div className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">暂无已保存角色，请先查询并保存</div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox"
                        checked={selectedSavedRoles.size === currentGameRoles.length && currentGameRoles.length > 0}
                        onChange={() => {
                          if (selectedSavedRoles.size === currentGameRoles.length) {
                            setSelectedSavedRoles(new Set());
                          } else {
                            setSelectedSavedRoles(new Set(currentGameRoles.map(r => r.role_id)));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500" />
                      <span className="text-xs font-medium text-slate-500">全选</span>
                    </label>
                    <span className="text-xs text-slate-400">已选 {selectedSavedRoles.size}/{currentGameRoles.length}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {sortedZoneGroups.map(group => (
                      <div key={group}>
                        <div className="px-3 py-1 bg-slate-50 border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-400">{group}</span>
                        </div>
                        {rolesByZoneGroup[group].map(r => {
                          const checked = selectedSavedRoles.has(r.role_id);
                          return (
                            <label key={r.role_id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors ${checked ? 'bg-blue-50' : ''}`}>
                              <input type="checkbox" checked={checked}
                                onChange={() => {
                                  setSelectedSavedRoles(prev => {
                                    const next = new Set(prev);
                                    if (next.has(r.role_id)) next.delete(r.role_id);
                                    else next.add(r.role_id);
                                    return next;
                                  });
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 shrink-0" />
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-sm text-slate-700 truncate">{r.role_name || r.role_id}</span>
                                <span className="text-xs text-slate-400 font-mono shrink-0">{r.role_id}</span>
                                <span className="text-xs text-slate-400 shrink-0">{r.world_name || r.world_id}</span>
                                <span className="text-xs text-slate-300 font-mono shrink-0">{r.zone}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">邮件ID (mail_id) <span className="text-red-500">*</span></label>
              {(videoGiftConfigs.length > 0 || cumulativeConfigs.length > 0 || wheelLotteries.length > 0) && (
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => { setUseVideoGift(false); setUseCumulative(false); setUseWheelLottery(false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!useVideoGift && !useCumulative && !useWheelLottery ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    手动输入
                  </button>
                  {wheelLotteries.length > 0 && (
                    <button onClick={() => { setUseWheelLottery(true); setUseVideoGift(false); setUseCumulative(false); setSelectedWheelPrizeIndices(new Set()); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${useWheelLottery ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      观影转盘抽奖
                    </button>
                  )}
                  {videoGiftConfigs.length > 0 && (
                    <button onClick={() => { setUseVideoGift(true); setUseCumulative(false); setUseWheelLottery(false); setSelectedVideoGiftIndices(new Set()); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${useVideoGift ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      观影有礼
                    </button>
                  )}
                  {cumulativeConfigs.length > 0 && (
                    <button onClick={() => { setUseCumulative(true); setUseVideoGift(false); setUseWheelLottery(false); setSelectedCumulativeIndices(new Set()); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${useCumulative ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      天天领福利
                    </button>
                  )}
                </div>
              )}
              {useVideoGift ? (

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox"
                        checked={selectedVideoGiftIndices.size === videoGiftConfigs.length && videoGiftConfigs.length > 0}
                        onChange={() => {
                          if (selectedVideoGiftIndices.size === videoGiftConfigs.length) {
                            setSelectedVideoGiftIndices(new Set());
                          } else {
                            setSelectedVideoGiftIndices(new Set(videoGiftConfigs.map((_, i) => i)));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                      <span className="text-xs font-medium text-slate-500">全选</span>
                    </label>
                    <span className="text-xs text-slate-400">已选 {selectedVideoGiftIndices.size}/{videoGiftConfigs.length} 次</span>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-slate-100">
                    {videoGiftConfigs.map((c, i) => {
                      const checked = selectedVideoGiftIndices.has(i);
                      return (
                        <label key={i} className={`flex flex-col gap-1 px-2.5 py-2 cursor-pointer hover:bg-slate-50 transition-colors bg-white ${checked ? 'ring-1 ring-orange-400 bg-orange-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checked}
                              onChange={() => {
                                setSelectedVideoGiftIndices(prev => {
                                  const next = new Set(prev);
                                  if (next.has(i)) next.delete(i); else next.add(i);
                                  return next;
                                });
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 shrink-0" />
                            <p className="text-xs font-medium text-slate-700">第{c.index}次</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate flex-1">{c.mail_id}</p>
                          </div>
                          <div className="flex items-start gap-3 ml-[22px]">
                            <div className="space-y-0.5">
                              {c.currentGifts.map((g, gi) => (
                                <div key={gi} className={`flex items-center gap-1.5 ${c.useBackup ? 'opacity-30' : ''}`}>
                                  <img src={g.icon} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                                  <span className="text-[10px] text-slate-600 truncate">{g.content}{g.quantity ? ` x${g.quantity}` : ''}</span>
                                </div>
                              ))}
                            </div>
                            {c.backupGifts.length > 0 && (
                              <div className="space-y-0.5">
                                {c.backupGifts.map((g, gi) => (
                                  <div key={gi} className={`flex items-center gap-1.5 ${c.useBackup ? '' : 'opacity-30'}`}>
                                    <img src={g.icon} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                                    <span className="text-[10px] text-slate-600 truncate">{g.content}{g.quantity ? ` x${g.quantity}` : ''}</span>
                                  </div>
                                ))}
                                <span className={`text-[10px] font-medium ${c.useBackup ? 'text-orange-500' : 'text-slate-300'}`}>
                                  {c.useBackup ? '生效中' : '备用'}
                                </span>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : useCumulative ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox"
                        checked={selectedCumulativeIndices.size === cumulativeConfigs.length && cumulativeConfigs.length > 0}
                        onChange={() => {
                          if (selectedCumulativeIndices.size === cumulativeConfigs.length) {
                            setSelectedCumulativeIndices(new Set());
                          } else {
                            setSelectedCumulativeIndices(new Set(cumulativeConfigs.map((_, i) => i)));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                      <span className="text-xs font-medium text-slate-500">全选</span>
                    </label>
                    <span className="text-xs text-slate-400">已选 {selectedCumulativeIndices.size}/{cumulativeConfigs.length} 天</span>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-slate-100">
                    {cumulativeConfigs.map((c, i) => {
                      const checked = selectedCumulativeIndices.has(i);
                      return (
                        <label key={i} className={`flex flex-col gap-1 px-2.5 py-2 cursor-pointer hover:bg-slate-50 transition-colors bg-white ${checked ? 'ring-1 ring-orange-400 bg-orange-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checked}
                              onChange={() => {
                                setSelectedCumulativeIndices(prev => {
                                  const next = new Set(prev);
                                  if (next.has(i)) next.delete(i); else next.add(i);
                                  return next;
                                });
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 shrink-0" />
                            <p className="text-xs font-medium text-slate-700">第{c.day}天</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate flex-1">{c.value}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ml-[22px]">
                            {c.icon && <img src={c.icon} alt="" className="w-5 h-5 rounded object-cover shrink-0" />}
                            <span className="text-[10px] text-slate-600 truncate">{c.name}{c.num_desc ? ` ${c.num_desc}` : ''}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : useWheelLottery ? (
                <div className="space-y-3">
                  <div className="relative" ref={wheelDropdownRef}>
                    <button onClick={() => setWheelDropdownOpen(v => !v)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left flex items-center justify-between">
                      <span className={selectedLotteryId ? 'text-slate-700' : 'text-slate-400'}>
                        {selectedLotteryId ? wheelLotteries.find(l => l.id === selectedLotteryId)?.lottery_name || '-- 选择观影转盘活动 --' : '-- 选择观影转盘活动 --'}
                      </span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {wheelDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {(wheelLotteryPage > 1 || wheelLotteryHasMore) && (
                          <div className="flex border-b border-slate-100">
                            {wheelLotteryPage > 1 && (
                              <button onClick={() => {
                                const prev = wheelLotteryPage - 1;
                                setWheelLotteryPage(prev);
                                const info = serverInfoMap[gameId];
                                fetchWheelLotteryList(info?.server_id || '', prev);
                              }}
                                className="flex-1 px-3 py-1.5 text-xs text-blue-500 hover:bg-blue-50 text-center">
                                ◀ 上一页
                              </button>
                            )}
                            {wheelLotteryHasMore && (
                              <button onClick={() => {
                                const next = wheelLotteryPage + 1;
                                setWheelLotteryPage(next);
                                const info = serverInfoMap[gameId];
                                fetchWheelLotteryList(info?.server_id || '', next);
                              }}
                                className="flex-1 px-3 py-1.5 text-xs text-blue-500 hover:bg-blue-50 text-center">
                                下一页 ▶
                              </button>
                            )}
                          </div>
                        )}
                        {wheelLotteries.map(l => (
                          <button key={l.id} onClick={() => {
                            setSelectedLotteryId(l.id);
                            setSelectedWheelPrizeIndices(new Set());
                            fetchWheelLotteryPrizes(l.id);
                            setWheelDropdownOpen(false);
                          }}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-50 ${l.id === selectedLotteryId ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-700'}`}>
                            {l.lottery_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {(() => {
                    const prizes = wheelPrizes.filter(p => p.section === 'prize');
                    const cumulative = wheelPrizes.filter(p => p.section === 'cumulative');
                    return (
                      <div className="space-y-3">
                        {prizes.length > 0 && (
                          <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox"
                                  checked={prizes.some(p => p.canSend) && prizes.filter(p => p.canSend).every(p => selectedWheelPrizeIndices.has(wheelPrizes.indexOf(p)))}
                                  onChange={() => {
                                    setSelectedWheelPrizeIndices(prev => {
                                      const next = new Set(prev);
                                      const sendable = prizes.filter(p => p.canSend);
                                      const allSelected = sendable.every(p => next.has(wheelPrizes.indexOf(p)));
                                      sendable.forEach(p => {
                                        const idx = wheelPrizes.indexOf(p);
                                        if (allSelected) next.delete(idx); else next.add(idx);
                                      });
                                      return next;
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                <span className="text-xs font-medium text-slate-500">普通奖品</span>
                              </label>
                              <span className="text-xs text-slate-400">已选 {prizes.filter(p => selectedWheelPrizeIndices.has(wheelPrizes.indexOf(p))).length}/{prizes.filter(p => p.canSend).length}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-px bg-slate-100">
                              {prizes.map(p => {
                                const idx = wheelPrizes.indexOf(p);
                                const checked = selectedWheelPrizeIndices.has(idx);
                                return (
                                  <label key={p.id} className={`flex flex-col gap-1 px-2.5 py-2 transition-colors bg-white ${p.canSend ? 'cursor-pointer hover:bg-slate-50' : 'opacity-40'} ${checked ? 'ring-1 ring-orange-400 bg-orange-50' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      {p.canSend ? (
                                        <input type="checkbox" checked={checked}
                                          onChange={() => {
                                            setSelectedWheelPrizeIndices(prev => {
                                              const next = new Set(prev);
                                              if (next.has(idx)) next.delete(idx); else next.add(idx);
                                              return next;
                                            });
                                          }}
                                          className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 shrink-0" />
                                      ) : (
                                        <span className="w-3.5 h-3.5 shrink-0" />
                                      )}
                                      <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-[22px]">
                                      {p.icon && <img src={p.icon} alt="" className="w-5 h-5 rounded object-cover shrink-0" />}
                                      <span className="text-[10px] text-slate-400 font-mono truncate">{p.prop_id}</span>
                                      <span className="text-[10px] text-slate-400">x{p.num}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {cumulative.length > 0 && (
                          <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox"
                                  checked={cumulative.some(p => p.canSend) && cumulative.filter(p => p.canSend).every(p => selectedWheelPrizeIndices.has(wheelPrizes.indexOf(p)))}
                                  onChange={() => {
                                    setSelectedWheelPrizeIndices(prev => {
                                      const next = new Set(prev);
                                      const sendable = cumulative.filter(p => p.canSend);
                                      const allSelected = sendable.every(p => next.has(wheelPrizes.indexOf(p)));
                                      sendable.forEach(p => {
                                        const idx = wheelPrizes.indexOf(p);
                                        if (allSelected) next.delete(idx); else next.add(idx);
                                      });
                                      return next;
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                <span className="text-xs font-medium text-slate-500">累抽奖品</span>
                              </label>
                              <span className="text-xs text-slate-400">已选 {cumulative.filter(p => selectedWheelPrizeIndices.has(wheelPrizes.indexOf(p))).length}/{cumulative.filter(p => p.canSend).length}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-px bg-slate-100">
                              {cumulative.map(p => {
                                const idx = wheelPrizes.indexOf(p);
                                const checked = selectedWheelPrizeIndices.has(idx);
                                return (
                                  <label key={p.id} className={`flex flex-col gap-1 px-2.5 py-2 transition-colors bg-white ${p.canSend ? 'cursor-pointer hover:bg-slate-50' : 'opacity-40'} ${checked ? 'ring-1 ring-orange-400 bg-orange-50' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      {p.canSend ? (
                                        <input type="checkbox" checked={checked}
                                          onChange={() => {
                                            setSelectedWheelPrizeIndices(prev => {
                                              const next = new Set(prev);
                                              if (next.has(idx)) next.delete(idx); else next.add(idx);
                                              return next;
                                            });
                                          }}
                                          className="w-3.5 h-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 shrink-0" />
                                      ) : (
                                        <span className="w-3.5 h-3.5 shrink-0" />
                                      )}
                                      <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-[22px]">
                                      {p.icon && <img src={p.icon} alt="" className="w-5 h-5 rounded object-cover shrink-0" />}
                                      <span className="text-[10px] text-slate-400 font-mono truncate">{p.prop_id}</span>
                                      <span className="text-[10px] text-slate-400">x{p.num}</span>
                                    </div>
                                    {p.times !== undefined && p.times > 0 && (
                                      <div className="ml-[22px] mt-0.5">
                                        <span className="text-[10px] text-orange-500">累抽{p.times}次</span>
                                        {p.guide_text && <span className="text-[10px] text-slate-400 ml-1">{p.guide_text}</span>}
                                      </div>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <textarea value={mailId} onChange={e => setMailId(e.target.value)} placeholder="输入邮件ID，多个用换行或逗号分隔" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              )}
            </div>

            {selectedRoles.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 space-y-1.5">
                {selectedRoles.map(r => (
                  <div key={r.role_id} className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700">{r.role_name || r.role_id}</span>
                    <span>zone: <span className="font-mono text-slate-600">{r.zone}</span></span>
                    <span>world_id: <span className="font-mono text-slate-600">{r.world_id}</span></span>
                    <span>role_id: <span className="font-mono text-slate-600">{r.role_id}</span></span>
                  </div>
                ))}
              </div>
            )}

            {sendError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">{sendError}</div>}

            <button onClick={handleSend} disabled={sending || selectedSavedRoles.size === 0} className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors">
              {sending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />发送中...</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>发送</>
              }
            </button>

            {sendResults.size > 0 && (() => {
              const resultsArr = Array.from(sendResults.values());
              const successCount = resultsArr.filter(r => !r.error).length;
              const failCount = resultsArr.filter(r => r.error).length;
              const maxDuration = Math.max(...resultsArr.map(r => r.duration));
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">发送结果</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{maxDuration}ms</span>
                      <span className="text-xs text-green-600 font-medium">成功 {successCount}</span>
                      {failCount > 0 && <span className="text-xs text-red-600 font-medium">失败 {failCount}</span>}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(() => {
                      const mailIds = useWheelLottery
                        ? [...selectedWheelPrizeIndices].map(i => wheelPrizes[i].prop_id)
                        : useCumulative
                        ? [...selectedCumulativeIndices].map(i => cumulativeConfigs[i].value)
                        : useVideoGift
                        ? [...selectedVideoGiftIndices].map(i => videoGiftConfigs[i].mail_id)
                        : mailId.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                      return selectedRoles.flatMap(role =>
                        mailIds.map(mail_id => {
                          const key = role.role_id + '|' + mail_id;
                          const result = sendResults.get(key);
                          if (!result) return null;
                          const ok = !result.error;
                          return (
                            <div key={key} className="px-4 py-2.5 flex items-center justify-between bg-white">
                              <div className="flex items-center gap-3 min-w-0">
                                {ok
                                  ? <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  : <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                }
                                <span className="text-sm font-medium text-slate-700 truncate">{role.role_name || role.role_id}</span>
                                <span className="text-xs text-slate-400 font-mono truncate">{mail_id}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-slate-400">{result.duration}ms</span>
                                {ok
                                  ? <span className="text-xs text-green-600 font-medium">成功</span>
                                  : <span className="text-xs text-red-500 font-medium max-w-[260px] truncate" title={result.error}>{result.error}</span>
                                }
                              </div>
                            </div>
                          );
                        })
                      );
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
        {/* 发送记录 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <h2 className="text-base font-semibold text-slate-800">发送记录</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* 筛选栏 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => { setRecordsTodayOnly(true); setRecordsPage(1); fetchRecords(1, true, recordsRoleFilter, gameId); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${recordsTodayOnly ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  今日
                </button>
                <button onClick={() => { setRecordsTodayOnly(false); setRecordsPage(1); fetchRecords(1, false, recordsRoleFilter, gameId); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!recordsTodayOnly ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  全部
                </button>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs">
                <select value={recordsRoleFilter}
                  onChange={e => { setRecordsRoleFilter(e.target.value); setRecordsPage(1); fetchRecords(1, recordsTodayOnly, e.target.value, gameId); }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">全部角色</option>
                  {sortedZoneGroups.map(group => (
                    <optgroup key={group} label={group}>
                      {rolesByZoneGroup[group].map(r => (
                        <option key={r.role_id} value={r.role_id}>
                          {r.role_name ? `${r.role_name} (${r.role_id})` : r.role_id}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <span className="text-xs text-slate-400 ml-auto">共 {recordsTotal} 条</span>
            </div>

            {/* 记录列表 */}
            {recordsLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />加载中...
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">暂无记录</div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">时间</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">游戏</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">角色</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">大区</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">邮件ID</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">环境</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">结果</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-xs text-slate-400 font-mono whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-slate-600">{r.game_label}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          <div>{r.role_name || '—'}</div>
                          <div className="text-slate-400 font-mono">{r.role_id}</div>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400 font-mono">{r.zone}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-600">{r.mail_id}</td>
                        <td className="px-3 py-2 text-xs text-slate-400">{r.env}</td>
                        <td className="px-3 py-2 text-xs">
                          {r.success
                            ? <span className="flex items-center gap-1 text-green-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />成功</span>
                            : <div>
                                <span className="flex items-center gap-1 text-red-500 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />失败</span>
                                {r.error_msg && <p className="mt-0.5 text-red-400 text-[11px] font-mono break-all leading-tight max-w-[200px]">{r.error_msg}</p>}
                              </div>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页 */}
            {recordsTotal > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={recordsPage <= 1} onClick={() => { const p = recordsPage - 1; setRecordsPage(p); fetchRecords(p, recordsTodayOnly, recordsRoleFilter, gameId); }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">上一页</button>
                <span className="text-sm text-slate-500">{recordsPage} / {Math.ceil(recordsTotal / PAGE_SIZE)}</span>
                <button disabled={recordsPage >= Math.ceil(recordsTotal / PAGE_SIZE)} onClick={() => { const p = recordsPage + 1; setRecordsPage(p); fetchRecords(p, recordsTodayOnly, recordsRoleFilter, gameId); }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">下一页</button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
