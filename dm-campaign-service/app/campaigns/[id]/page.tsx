'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { authHeaders, clearToken, getToken } from '@/lib/token';
import DiceBox3D from '@/components/DiceBox3D';

const CHARACTER_SHEET_URL = process.env.NEXT_PUBLIC_CHARACTER_SHEET_URL || '';

type CampaignDetail = {
  id: string;
  name: string;
  status: string;
  isDm: boolean;
  isMember?: boolean;
  backgroundIntro: string | null;
  backgroundImageUrl: string | null;
  nextSessionAt?: string | null;
  members?: { id: string; userId: string; characterId: string; joinedAt: string }[];
};

type Encounter = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  startedAt: string | null;
  currentRound: number;
  currentTurnIndex: number;
  createdAt?: string;
};

type InitiativeEntry = {
  id: string;
  type: string;
  characterId: string | null;
  userId: string | null;
  name: string;
  avatarUrl: string | null;
  initiativeBonus: number;
  currentInitiative: number | null;
  hp: number | null;
  maxHp: number | null;
  ac: number | null;
  notes: string | null;
  orderIndex: number;
  /** 是否为当前登录用户（玩家端用此显示「掷」按钮） */
  isCurrentUser?: boolean;
};

type InitiativeData = {
  encounter: { id: string; name: string; startedAt: string | null; currentRound: number; currentTurnIndex: number };
  entries: InitiativeEntry[];
};

type CampaignEventItem = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const api = (path: string, options?: RequestInit) =>
  fetch(path, { redirect: 'manual', ...options, headers: { ...authHeaders(), ...options?.headers } });

function formatEventLine(e: CampaignEventItem): string {
  if (e.type === 'turn_advance') {
    const name = (e.payload.currentEntryName as string) ?? '—';
    const round = (e.payload.currentRound as number) ?? 0;
    return `第 ${round} 回合 · 当前到 ${name} 行动`;
  }
  if (e.type === 'hp_change') {
    const name = (e.payload.entryName as string) ?? '—';
    const hp = (e.payload.hp as number) ?? '?';
    const maxHp = (e.payload.maxHp as number) ?? '?';
    const prev = e.payload.previousHp as number | undefined;
    if (prev !== undefined && prev !== null && hp !== prev) {
      return `${name} 生命值 ${hp}/${maxHp}`;
    }
    return `${name} 生命值 ${hp}/${maxHp}`;
  }
  if (e.type === 'dice_roll') {
    const formula = (e.payload.formula as string) ?? '?';
    const total = (e.payload.total as number) ?? (e.payload.sum as number);
    const who = (e.payload.actorName as string)?.trim();
    return who ? `${who} 掷骰 ${formula} = ${total}` : `掷骰 ${formula} = ${total}`;
  }
  if (e.type === 'initiative_roll') {
    const name = (e.payload.entryName as string) ?? '—';
    const roll = (e.payload.roll as number) ?? '?';
    const bonus = (e.payload.bonus as number) ?? 0;
    const total = (e.payload.currentInitiative as number) ?? '?';
    return `${name} 投了先攻：d20(${roll})+${bonus} = ${total}`;
  }
  if (e.type === 'initiative_roll_batch') {
    const count = (e.payload.count as number) ?? 0;
    const entries = (e.payload.entries as { name: string; currentInitiative: number }[]) ?? [];
    if (entries.length > 0) {
      const parts = entries.map((x) => `${x.name}(${x.currentInitiative})`).join('、');
      return `全体掷先攻（${count} 人）：${parts}`;
    }
    return `全体掷先攻（${count} 人）`;
  }
  if (e.type === 'encounter_new_battle') {
    const name = (e.payload.encounterName as string) ?? '—';
    return `开始新战斗：${name}`;
  }
  if (e.type === 'encounter_started') {
    const name = (e.payload.encounterName as string) ?? '—';
    return `开始遭遇：${name}`;
  }
  if (e.type === 'encounter_ended') {
    const name = (e.payload.encounterName as string) ?? '—';
    return `结束遭遇：${name}`;
  }
  return `${e.type}`;
}

export default function CampaignHallPage() {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [meUserId, setMeUserId] = useState<string | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
  const [initiative, setInitiative] = useState<InitiativeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEncounterName, setNewEncounterName] = useState('');
  const [addingEncounter, setAddingEncounter] = useState(false);
  const [npcName, setNpcName] = useState('');
  const [addingNpc, setAddingNpc] = useState(false);
  const [editingHpEntryId, setEditingHpEntryId] = useState<string | null>(null);
  const [editingHpValue, setEditingHpValue] = useState('');
  const [editingAcEntryId, setEditingAcEntryId] = useState<string | null>(null);
  const [editingAcValue, setEditingAcValue] = useState('');
  const [editingInitiativeEntryId, setEditingInitiativeEntryId] = useState<string | null>(null);
  const [editingInitiativeValue, setEditingInitiativeValue] = useState('');
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [events, setEvents] = useState<CampaignEventItem[]>([]);
  /** 战役日志页签：null = 全部，否则为遭遇 id */
  const [logTabEncounterId, setLogTabEncounterId] = useState<string | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [diceCounts, setDiceCounts] = useState<Record<string, number>>({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
  const [diceModifier, setDiceModifier] = useState('');
  const [diceRolling, setDiceRolling] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState<{
    result: number;
    rolls: number[];
    formula: string;
    parts?: { formula: string; rolls: number[] }[];
  } | null>(null);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [joinCharacterId, setJoinCharacterId] = useState('');
  const [joinCharacters, setJoinCharacters] = useState<{ serverId: string; name: string }[]>([]);
  const [joinCharsLoading, setJoinCharsLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinNeedLogin, setJoinNeedLogin] = useState(false);
  const [campaignLogs, setCampaignLogs] = useState<{ id: string; userId: string; content: string; createdAt: string }[]>([]);
  const [newLogContent, setNewLogContent] = useState('');
  const [addingLog, setAddingLog] = useState(false);

  const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const;

  const buildDiceFormula = useCallback(() => {
    const parts = DICE_TYPES.filter((t) => (diceCounts[t] ?? 0) > 0).map((t) => `${diceCounts[t]}${t}`);
    const base = parts.length ? parts.join('+') : '';
    const mod = diceModifier.trim();
    if (!mod) return base;
    const modPart = /^[+-]/.test(mod) ? mod : `+${mod}`;
    return base ? `${base}${modPart}` : mod;
  }, [diceCounts, diceModifier]);

  const addDice = (type: string) => {
    setDiceCounts((prev) => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
  };

  const clearDice = () => {
    setDiceCounts({ d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 });
    setDiceModifier('');
  };

  const loadCampaign = useCallback(() => {
    if (!id) return;
    api(`/api/campaigns/${id}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = '/campaigns';
          return null;
        }
        if (!r.ok) throw new Error('加载失败');
        return r.json();
      })
      .then((data) => {
        if (data?.campaign) setCampaign(data.campaign);
      })
      .catch(() => setError('加载失败'));
  }, [id]);
  const reloadCampaign = useCallback(() => {
    loadCampaign();
  }, [loadCampaign]);

  const loadMe = useCallback(() => {
    api('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.userId) setMeUserId(data.user.userId);
      })
      .catch(() => {});
  }, []);

  const loadEncounters = useCallback(() => {
    if (!id) return;
    api(`/api/campaigns/${id}/encounters`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.encounters) {
          setEncounters(data.encounters);
          const active = data.encounters.find((e: Encounter) => e.isActive);
          if (active) setActiveEncounterId(active.id);
          else setActiveEncounterId((prev) => (prev && data.encounters.some((e: Encounter) => e.id === prev) ? prev : null));
        }
      })
      .catch(() => {});
  }, [id]);

  const loadInitiative = useCallback(() => {
    if (!id || !activeEncounterId) {
      setInitiative(null);
      return;
    }
    api(`/api/campaigns/${id}/encounters/${activeEncounterId}/initiative`)
      .then((r) => {
        if (r.ok) return r.json();
        if (r.status === 404) {
          setInitiative(null);
          loadEncounters();
          return null;
        }
        return null;
      })
      .then((data) => {
        if (data?.entries) setInitiative({ encounter: data.encounter, entries: data.entries });
        else setInitiative(null);
      })
      .catch(() => setInitiative(null));
  }, [id, activeEncounterId, loadEncounters]);

  const loadEvents = useCallback(() => {
    if (!id) return;
    api(`/api/campaigns/${id}/events?limit=50`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []) as CampaignEventItem[];
        setEvents([...list].reverse());
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      loadCampaign(),
      loadMe(),
    ]).finally(() => setLoading(false));
  }, [id, loadCampaign, loadMe]);

  useEffect(() => {
    if (campaign?.isMember !== false) loadEncounters();
  }, [id, campaign?.isMember, loadEncounters]);

  useEffect(() => {
    loadInitiative();
  }, [loadInitiative]);

  useEffect(() => {
    if (campaign?.isMember !== false) loadEvents();
  }, [id, campaign?.isMember, loadEvents]);

  const loadCampaignLogs = useCallback(() => {
    if (!id || campaign?.isMember === false) return;
    api(`/api/campaigns/${id}/logs`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logs) setCampaignLogs(data.logs);
      })
      .catch(() => {});
  }, [id, campaign?.isMember]);

  useEffect(() => {
    loadCampaignLogs();
  }, [loadCampaignLogs]);

  useEffect(() => {
    if (campaign?.isMember !== false || !id) return;
    setJoinNeedLogin(false);
    setJoinCharsLoading(true);
    api('/api/characters')
      .then((r) => {
        if (r.status === 401) setJoinNeedLogin(true);
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (data?.characters) setJoinCharacters(data.characters);
        else setJoinCharacters([]);
      })
      .catch(() => setJoinCharacters([]))
      .finally(() => setJoinCharsLoading(false));
  }, [id, campaign?.isMember]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadEncounters();
      loadInitiative();
      loadEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadEncounters, loadInitiative, loadEvents]);

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;
    const url = `/api/campaigns/${id}/events/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as CampaignEventItem & { payload?: object };
        if (data.type && data.createdAt) {
          setEvents((prev) => [...prev, { id: data.id ?? '', type: data.type, payload: (data.payload ?? {}) as Record<string, unknown>, createdAt: data.createdAt }]);
          eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch { /* ignore parse error */ }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [id]);

  const switchEncounter = (eid: string) => {
    if (!id || !campaign?.isDm) return;
    setActiveEncounterId(eid);
    api(`/api/campaigns/${id}/encounters/${eid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true }),
    }).then(() => {
      loadEncounters();
      loadInitiative();
    });
  };

  const startEncounter = async () => {
    if (!id || !campaign?.isDm || !activeEncounterId) return;
    const res = await api(`/api/campaigns/${id}/encounters/${activeEncounterId}/start`, { method: 'POST' });
    if (res.ok) {
      await loadEncounters();
      await loadInitiative();
    }
  };

  const endCurrentEncounter = async () => {
    if (!id || !campaign?.isDm || !activeEncounterId) return;
    if (!confirm('确定结束当前遭遇？将清空先攻面板，并回到创建新遭遇。')) return;
    const endedId = activeEncounterId;
    const res = await api(`/api/campaigns/${id}/encounters/${endedId}/end`, { method: 'POST' });
    if (res.ok) {
      setActiveEncounterId(null);
      setInitiative(null);
      await loadEncounters();
    }
  };

  const createEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !campaign?.isDm || !newEncounterName.trim()) return;
    setAddingEncounter(true);
    try {
      const res = await api(`/api/campaigns/${id}/encounters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEncounterName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewEncounterName('');
        if (data?.encounter?.id) setActiveEncounterId(data.encounter.id);
        await loadEncounters();
      }
    } finally {
      setAddingEncounter(false);
    }
  };

  const addNpc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !activeEncounterId || !campaign?.isDm || !npcName.trim()) return;
    setAddingNpc(true);
    try {
      const res = await api(`/api/campaigns/${id}/encounters/${activeEncounterId}/initiative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'npc', name: npcName.trim() }),
      });
      if (res.ok) {
        setNpcName('');
        loadInitiative();
      }
    } finally {
      setAddingNpc(false);
    }
  };

  const rollInitiative = async (entryId?: string) => {
    if (!id || !activeEncounterId) return;
    setLastDiceResult(null);
    const res = await api(`/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/roll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryId ? { entryId } : {}),
    });
    if (res.ok) {
      const data = await res.json();
      loadInitiative();
      if (data.roll != null && data.bonus != null && data.currentInitiative != null) {
        setLastDiceResult({
          result: data.currentInitiative,
          rolls: [data.roll],
          formula: `d20+${data.bonus}`,
          parts: [{ formula: 'd20', rolls: [data.roll] }],
        });
      }
    }
  };

  const nextTurn = async () => {
    if (!id || !activeEncounterId || !campaign?.isDm) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/next-turn`,
      { method: 'POST' }
    );
    if (res.ok) loadInitiative();
  };

  const setCurrentTurn = async (turnIndex: number) => {
    if (!id || !activeEncounterId || !campaign?.isDm) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/set-turn`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnIndex }),
      }
    );
    if (res.ok) loadInitiative();
  };

  const refreshMyEntry = async () => {
    if (!id || !activeEncounterId) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-entry' }),
      }
    );
    if (res.ok) loadInitiative();
  };

  const saveHp = async (entryId: string, hp: number) => {
    if (!id || !activeEncounterId) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/${entryId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hp }),
      }
    );
    if (res.ok) {
      setEditingHpEntryId(null);
      setEditingHpValue('');
      loadInitiative();
    }
  };

  const saveAc = async (entryId: string, ac: number) => {
    if (!id || !activeEncounterId) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/${entryId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ac }),
      }
    );
    if (res.ok) {
      setEditingAcEntryId(null);
      setEditingAcValue('');
      loadInitiative();
    }
  };

  const saveInitiativeValue = async (entryId: string, value: number) => {
    if (!id || !activeEncounterId) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/${entryId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentInitiative: value }),
      }
    );
    if (res.ok) {
      setEditingInitiativeEntryId(null);
      setEditingInitiativeValue('');
      loadInitiative();
    }
  };

  const reorderInitiative = async (orderedEntryIds: string[]) => {
    if (!id || !activeEncounterId || !campaign?.isDm) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/reorder`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedEntryIds }),
      }
    );
    if (res.ok) loadInitiative();
  };

  const deleteEntry = async (entryId: string) => {
    if (!id || !activeEncounterId || !campaign?.isDm) return;
    if (!confirm('确定移出先攻列表？')) return;
    const res = await api(
      `/api/campaigns/${id}/encounters/${activeEncounterId}/initiative/${entryId}`,
      { method: 'DELETE' }
    );
    if (res.ok) loadInitiative();
  };

  const rollDice = async (formula: string) => {
    if (!id || !formula.trim()) return;
    const actorName =
      initiative?.entries.find((e) => e.userId === meUserId)?.name ??
      (campaign?.isDm ? 'DM' : undefined);
    setDiceRolling(true);
    setLastDiceResult(null);
    try {
      const res = await api(`/api/campaigns/${id}/dice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: formula.trim(),
          ...(actorName ? { actorName } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && data.result !== undefined) {
        setLastDiceResult({
          result: data.result,
          rolls: data.rolls ?? [],
          formula: data.formula ?? formula,
          ...(data.parts && data.parts.length > 0 ? { parts: data.parts } : {}),
        });
      }
    } finally {
      setDiceRolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-700">加载中…</p>
      </div>
    );
  }
  if (error || !campaign) {
    return (
      <div className="min-h-screen p-4 bg-slate-50">
        <p className="text-red-600">{error || '战役不存在'}</p>
        <Link href="/campaigns" className="text-gray-800 underline mt-2 inline-block">
          返回列表
        </Link>
      </div>
    );
  }

  if (campaign.isMember === false) {
    const handleJoin = async (e: React.FormEvent) => {
      e.preventDefault();
      setJoinError('');
      if (!joinInviteCode.trim() || !joinCharacterId) {
        setJoinError('请填写邀请码并选择角色');
        return;
      }
      setJoinSubmitting(true);
      try {
        const res = await api('/api/campaigns/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviteCode: joinInviteCode.trim().toUpperCase(),
            characterId: joinCharacterId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setJoinError(data.error || '加入失败');
          return;
        }
        reloadCampaign();
      } catch {
        setJoinError('网络错误');
      } finally {
        setJoinSubmitting(false);
      }
    };
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <Link href="/campaigns" className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm">
            返回列表
          </Link>
        </div>
        {(campaign.backgroundImageUrl || campaign.backgroundIntro) && (
          <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
            <h2 className="font-medium mb-2 text-gray-900">战役背景</h2>
            {campaign.backgroundImageUrl && (
              <img
                src={campaign.backgroundImageUrl}
                alt="战役背景"
                className="w-full max-h-48 object-cover rounded mb-3"
              />
            )}
            {campaign.backgroundIntro && (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{campaign.backgroundIntro}</p>
            )}
          </section>
        )}
        <section className="border border-gray-200 rounded p-4 bg-white">
          <h2 className="font-medium mb-2 text-gray-900">加入此战役</h2>
          {joinNeedLogin ? (
            <p className="text-gray-700 mb-4">
              请先使用角色卡账号登录后再加入战役。
              {CHARACTER_SHEET_URL && (
                <a
                  href={`${CHARACTER_SHEET_URL}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  className="ml-2 text-emerald-600 hover:underline"
                >
                  去登录
                </a>
              )}
            </p>
          ) : (
            <>
          <p className="text-sm text-gray-600 mb-3">输入 DM 提供的邀请码并选择要使用的角色即可加入。</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邀请码</label>
              <input
                type="text"
                value={joinInviteCode}
                onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 uppercase placeholder:text-gray-500"
                placeholder="6 位邀请码"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择角色</label>
              {joinCharsLoading ? (
                <p className="text-gray-600 text-sm">加载角色列表…</p>
              ) : joinCharacters.length === 0 ? (
                <p className="text-gray-600 text-sm">暂无角色，请先在角色卡中创建角色。</p>
              ) : (
                <select
                  value={joinCharacterId}
                  onChange={(e) => setJoinCharacterId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
                >
                  <option value="">请选择</option>
                  {joinCharacters.map((c) => (
                    <option key={c.serverId} value={c.serverId}>
                      {c.name || '未命名'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {joinError && <p className="text-red-600 text-sm">{joinError}</p>}
            <button
              type="submit"
              disabled={joinSubmitting || joinCharacters.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {joinSubmitting ? '加入中…' : '加入'}
            </button>
          </form>
            </>
          )}
        </section>
      </div>
    );
  }

  const currentEntryId =
    initiative && initiative.entries[initiative.encounter.currentTurnIndex]
      ? initiative.entries[initiative.encounter.currentTurnIndex].id
      : null;

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
        <div className="flex gap-2">
          {campaign.isDm && (
            <Link
              href={`/campaigns/${id}/settings`}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm"
            >
              设置
            </Link>
          )}
          <Link href="/campaigns" className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm">
            返回列表
          </Link>
          <button
            type="button"
            onClick={() => {
              clearToken();
              window.location.href = '/campaigns';
            }}
            className="px-3 py-1.5 border border-amber-300 rounded hover:bg-amber-100 bg-amber-50/80 text-amber-900 text-sm"
          >
            退出登录
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        {campaign.isDm ? '（你是 DM）' : '（你是玩家）'} · 成员 {(campaign.members?.length ?? 0) + 1} 人
      </p>

      {(campaign.backgroundImageUrl || campaign.backgroundIntro) && (
        <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
          <h2 className="font-medium mb-2 text-gray-900">战役背景</h2>
          {campaign.backgroundImageUrl && (
            <img
              src={campaign.backgroundImageUrl}
              alt="战役背景"
              className="w-full max-h-48 object-cover rounded mb-3"
            />
          )}
          {campaign.backgroundIntro && (
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{campaign.backgroundIntro}</p>
          )}
        </section>
      )}

      <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">遭遇与先攻</h2>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <select
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900"
            value={activeEncounterId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              if (v) switchEncounter(v);
              else setActiveEncounterId(null);
            }}
          >
            <option value="">{encounters.length === 0 ? '暂无遭遇' : '请选择或新建遭遇'}</option>
            {encounters.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} {e.isActive ? '(当前)' : ''}
              </option>
            ))}
          </select>
          {campaign.isDm && (
            <>
              {activeEncounterId && (() => {
                const enc = encounters.find((e) => e.id === activeEncounterId);
                const started = enc?.startedAt;
                if (!started) {
                  return (
                    <button
                      type="button"
                      className="px-2 py-1 text-sm border border-emerald-600 text-emerald-700 rounded hover:bg-emerald-50 bg-white"
                      onClick={startEncounter}
                    >
                      开始遭遇
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    className="px-2 py-1 text-sm border border-amber-600 text-amber-700 rounded hover:bg-amber-50 bg-white"
                    onClick={endCurrentEncounter}
                  >
                    结束当前遭遇
                  </button>
                );
              })()}
              <form onSubmit={createEncounter} className="flex gap-1 items-center">
                <input
                  type="text"
                  placeholder="新遭遇名称"
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-32 bg-white text-gray-900 placeholder:text-gray-500"
                  value={newEncounterName}
                  onChange={(e) => setNewEncounterName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 disabled:opacity-50"
                  disabled={addingEncounter || !newEncounterName.trim()}
                >
                  新建
                </button>
              </form>
            </>
          )}
        </div>

        {activeEncounterId && !encounters.find((e) => e.id === activeEncounterId)?.startedAt && (
          <p className="text-sm text-gray-600 mt-2">
            点击「开始遭遇」后会自动获取当前加入战役的玩家并填充先攻，届时可添加 NPC。
          </p>
        )}
        {activeEncounterId && encounters.find((e) => e.id === activeEncounterId)?.startedAt && (
          <>
            {initiative && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">
                  第 {initiative.encounter.currentRound} 回合 · 当前行动：
                  <strong className="text-gray-900 ml-1">{initiative.entries[initiative.encounter.currentTurnIndex]?.name ?? '-'}</strong>
                </span>
                {campaign.isDm && (
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                    onClick={nextTurn}
                  >
                    下一个行动
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {campaign.isDm && (
                <button
                  type="button"
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800"
                  onClick={() => rollInitiative()}
                >
                  全体掷先攻
                </button>
              )}
              <button
                type="button"
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800"
                onClick={refreshMyEntry}
              >
                刷新我的数据
              </button>
            </div>

            {campaign.isDm && (
              <form onSubmit={addNpc} className="flex gap-1 items-center mb-3">
                <input
                  type="text"
                  placeholder="NPC 名称"
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-28 bg-white text-gray-900 placeholder:text-gray-500"
                  value={npcName}
                  onChange={(e) => setNpcName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 disabled:opacity-50"
                  disabled={addingNpc || !npcName.trim()}
                >
                  添加 NPC
                </button>
              </form>
            )}

            {initiative && initiative.entries.length > 0 ? (
              <table className="w-full text-sm border-collapse text-gray-800">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50">
                    {campaign.isDm && <th className="w-6 p-1 text-gray-500 font-normal">拖拽</th>}
                    <th className="text-left p-2 text-gray-900 font-medium">顺序</th>
                    <th className="text-left p-2 text-gray-900 font-medium">名称</th>
                    <th className="text-left p-2 text-gray-900 font-medium">先攻</th>
                    <th className="text-left p-2 text-gray-900 font-medium">AC</th>
                    <th className="text-left p-2 text-gray-900 font-medium">HP</th>
                    {campaign.isDm && <th className="text-left p-2 text-gray-900 font-medium">操作</th>}
                  </tr>
                </thead>
                <tbody>
                  {initiative.entries.map((entry, idx) => {
                    const isCurrent = entry.id === currentEntryId;
                    const isMe = meUserId && entry.userId === meUserId;
                    const canEditHp = campaign.isDm || isMe;
                    const hpVisible = entry.hp !== null || campaign.isDm;
                    const canEditAc = campaign.isDm;
                    return (
                      <tr
                        key={entry.id}
                        draggable={campaign.isDm}
                        onDragStart={() => campaign.isDm && setDraggedEntryId(entry.id)}
                        onDragOver={(ev) => { if (campaign.isDm && ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'; ev.preventDefault(); }}
                        onDrop={(ev) => {
                          ev.preventDefault();
                          if (!campaign.isDm || !draggedEntryId || draggedEntryId === entry.id) return;
                          const ids = initiative.entries.map((e) => e.id);
                          const from = ids.indexOf(draggedEntryId);
                          const to = ids.indexOf(entry.id);
                          if (from === -1 || to === -1) return;
                          const next = [...ids];
                          next.splice(from, 1);
                          next.splice(to, 0, draggedEntryId);
                          reorderInitiative(next);
                          setDraggedEntryId(null);
                        }}
                        onDragEnd={() => setDraggedEntryId(null)}
                        className={`border-b border-gray-100 ${isCurrent ? 'bg-amber-50/80' : 'bg-white'} ${draggedEntryId === entry.id ? 'opacity-60' : ''}`}
                      >
                        {campaign.isDm && (
                          <td className="p-1 text-gray-400 cursor-grab active:cursor-grabbing" title="拖拽调整顺序">
                            ⋮⋮
                          </td>
                        )}
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {entry.avatarUrl ? (
                              <span className="flex-shrink-0 w-9 h-9 rounded overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                  src={
                                    entry.avatarUrl.startsWith('http') || entry.avatarUrl.startsWith('data:')
                                      ? entry.avatarUrl
                                      : `${CHARACTER_SHEET_URL}${entry.avatarUrl.startsWith('/') ? '' : '/'}${entry.avatarUrl}`
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                  width={36}
                                  height={36}
                                />
                              </span>
                            ) : (
                              <span className="flex-shrink-0 w-9 h-9 rounded bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">头像</span>
                            )}
                            <span>
                              {entry.type === 'player' && entry.characterId && CHARACTER_SHEET_URL ? (
                                <a
                                  href={`${CHARACTER_SHEET_URL.replace(/\/$/, '')}/characters/${entry.characterId}/character-sheet`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-900 hover:text-blue-600 hover:underline"
                                >
                                  {entry.name}
                                </a>
                              ) : (
                                <span className="text-gray-900">{entry.name}</span>
                              )}
                              {entry.initiativeBonus != null && entry.initiativeBonus !== 0 && (
                                <span className="ml-1 text-gray-500">(+{entry.initiativeBonus})</span>
                              )}
                              {entry.type === 'npc' && (
                                <span className="ml-1 text-gray-500">(NPC)</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          {editingInitiativeEntryId === entry.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const v = parseInt(editingInitiativeValue, 10);
                                if (!Number.isNaN(v)) saveInitiativeValue(entry.id, v);
                              }}
                              className="flex gap-1 items-center"
                            >
                              <input
                                type="number"
                                className="w-12 border border-gray-300 rounded px-1 py-0.5 text-sm bg-white text-gray-900"
                                value={editingInitiativeValue}
                                onChange={(e) => setEditingInitiativeValue(e.target.value)}
                                autoFocus
                              />
                              <button type="submit" className="text-xs px-1 border border-gray-300 rounded bg-white text-gray-800 hover:bg-gray-100">保存</button>
                              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => { setEditingInitiativeEntryId(null); setEditingInitiativeValue(''); }}>取消</button>
                            </form>
                          ) : (
                            <>
                              {entry.currentInitiative !== null ? (
                                <span className="text-gray-800">{entry.currentInitiative}</span>
                              ) : (
                                <span className="text-gray-500">未掷</span>
                              )}
                              {(campaign.isDm || isMe || entry.isCurrentUser) && (
                                <button
                                  type="button"
                                  className="ml-1 px-1 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-700"
                                  onClick={() => rollInitiative(entry.id)}
                                >
                                  掷
                                </button>
                              )}
                              {campaign.isDm && entry.currentInitiative != null && (
                                <button
                                  type="button"
                                  className="ml-1 text-xs text-gray-500 hover:underline"
                                  onClick={() => {
                                    setEditingInitiativeEntryId(entry.id);
                                    setEditingInitiativeValue(String(entry.currentInitiative ?? ''));
                                  }}
                                >
                                  改
                                </button>
                              )}
                            </>
                          )}
                        </td>
                        <td className="p-2">
                          {editingAcEntryId === entry.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const v = parseInt(editingAcValue, 10);
                                if (!Number.isNaN(v)) saveAc(entry.id, v);
                              }}
                              className="flex gap-1 items-center"
                            >
                              <input
                                type="number"
                                className="w-12 border border-gray-300 rounded px-1 py-0.5 text-sm bg-white text-gray-900"
                                value={editingAcValue}
                                onChange={(e) => setEditingAcValue(e.target.value)}
                                autoFocus
                              />
                              <button type="submit" className="text-xs px-1 border border-gray-300 rounded bg-white text-gray-800 hover:bg-gray-100">保存</button>
                              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => { setEditingAcEntryId(null); setEditingAcValue(''); }}>取消</button>
                            </form>
                          ) : canEditAc ? (
                            <button
                              type="button"
                              className="text-left text-gray-800 hover:underline min-w-[2rem]"
                              onClick={() => {
                                setEditingAcEntryId(entry.id);
                                setEditingAcValue(String(entry.ac ?? ''));
                              }}
                            >
                              {entry.ac != null ? entry.ac : '—'}
                            </button>
                          ) : (
                            <span className="text-gray-600">{entry.ac != null ? entry.ac : '—'}</span>
                          )}
                        </td>
                        <td className="p-2">
                          {editingHpEntryId === entry.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const v = parseInt(editingHpValue, 10);
                                if (!Number.isNaN(v)) saveHp(entry.id, v);
                              }}
                              className="flex gap-1 items-center"
                            >
                              <input
                                type="number"
                                className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm bg-white text-gray-900"
                                value={editingHpValue}
                                onChange={(e) => setEditingHpValue(e.target.value)}
                                autoFocus
                              />
                              <button type="submit" className="text-xs px-1 border border-gray-300 rounded bg-white text-gray-800 hover:bg-gray-100">
                                保存
                              </button>
                              <button
                                type="button"
                                className="text-xs text-gray-600 hover:underline"
                                onClick={() => {
                                  setEditingHpEntryId(null);
                                  setEditingHpValue('');
                                }}
                              >
                                取消
                              </button>
                            </form>
                          ) : hpVisible && canEditHp ? (
                            <button
                              type="button"
                              className="text-left text-gray-800 hover:underline"
                              onClick={() => {
                                setEditingHpEntryId(entry.id);
                                setEditingHpValue(String(entry.hp ?? ''));
                              }}
                            >
                              {entry.hp ?? '-'} / {entry.maxHp ?? '-'}
                            </button>
                          ) : (
                            <span className="text-gray-600">
                              {entry.hp != null ? `${entry.hp} / ${entry.maxHp ?? '-'}` : '-'}
                            </span>
                          )}
                        </td>
                        {campaign.isDm && (
                          <td className="p-2">
                            {isCurrent ? (
                              <span className="text-amber-700 text-xs">当前</span>
                            ) : (
                              <button
                                type="button"
                                className="text-xs text-amber-700 hover:underline"
                                onClick={() => setCurrentTurn(idx)}
                              >
                                设为当前
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-xs text-red-600 hover:underline ml-1"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              移除
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-sm">已加入战役的角色会自动列在上方，玩家可点「掷」投先攻；DM 可添加 NPC。</p>
            )}
          </>
        )}
      </section>

      <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">遭遇动态</h2>
        {encounters.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 border-b border-gray-200 pb-2">
            {(() => {
              const activeFirst = [...encounters].sort((a, b) => {
                if (a.isActive) return -1;
                if (b.isActive) return 1;
                return (new Date(a.createdAt ?? 0).getTime()) - (new Date(b.createdAt ?? 0).getTime());
              });
              const selectedId = logTabEncounterId;
              return (
                <>
                  <button
                    type="button"
                    className={`px-2 py-1 text-sm rounded border ${
                      selectedId === null
                        ? 'bg-amber-100 border-amber-500 text-amber-900'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setLogTabEncounterId(null)}
                  >
                    全部
                  </button>
                  {activeFirst.map((enc) => (
                    <button
                      key={enc.id}
                      type="button"
                      className={`px-2 py-1 text-sm rounded border ${
                        selectedId === enc.id
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setLogTabEncounterId(enc.id)}
                    >
                      {enc.name}
                      {enc.isActive && ' (当前)'}
                    </button>
                  ))}
                </>
              );
            })()}
          </div>
        )}
        <div className="bg-slate-50 rounded p-2 max-h-40 overflow-auto text-sm space-y-1 text-gray-700" role="log">
          {(() => {
            const selectedId = logTabEncounterId;
            const filtered =
              selectedId === null
                ? events
                : events.filter((e) => {
                    const encId = (e.payload as { encounterId?: string }).encounterId;
                    return encId === selectedId;
                  });
            if (filtered.length === 0) return <p className="text-gray-500">暂无事件。先攻掷骰、推进回合或变更 HP 后会出现记录。</p>;
            return (
              <>
                {filtered.map((e) => (
                  <div key={e.id}>
                    <span className="text-gray-500 mr-2">{new Date(e.createdAt).toLocaleTimeString()}</span>
                    {formatEventLine(e)}
                  </div>
                ))}
                <div ref={eventsEndRef} />
              </>
            );
          })()}
        </div>
      </section>

      <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">骰子</h2>
        <p className="text-sm text-gray-500 mb-2">点击骰子类型累加，点「掷骰」时再出结果</p>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {DICE_TYPES.map((f) => (
            <button
              key={f}
              type="button"
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm font-mono disabled:opacity-50"
              disabled={diceRolling}
              onClick={() => addDice(f)}
            >
              {f}
              {(diceCounts[f] ?? 0) > 0 && (
                <span className="ml-1 text-amber-600 font-medium">×{diceCounts[f]}</span>
              )}
            </button>
          ))}
          <button
            type="button"
            className="px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
            onClick={clearDice}
          >
            清空
          </button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 font-mono min-w-[120px]">
            当前公式：{buildDiceFormula() || '—'}
          </span>
          <input
            type="text"
            placeholder="修正值，如 +3 或 -1"
            className="border border-gray-300 rounded px-2 py-1.5 text-sm font-mono w-28 bg-white text-gray-900 placeholder:text-gray-500"
            value={diceModifier}
            onChange={(e) => setDiceModifier(e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm disabled:opacity-50"
            disabled={diceRolling || !buildDiceFormula().trim()}
            onClick={() => rollDice(buildDiceFormula())}
          >
            掷骰
          </button>
        </div>
        {lastDiceResult && (
          <>
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-mono">{lastDiceResult.formula}</span>
              {lastDiceResult.rolls.length > 0 && (
                <span className="text-gray-500 ml-1">（{lastDiceResult.rolls.join(', ')}）</span>
              )}
              {' = '}
              <strong className="text-gray-900">{lastDiceResult.result}</strong>
            </p>
            <div className="mt-3">
              <DiceBox3D
                trigger={{
                  rolls: lastDiceResult.rolls,
                  formula: lastDiceResult.formula,
                  parts: lastDiceResult.parts,
                }}
                onClose={() => setLastDiceResult(null)}
              />
            </div>
          </>
        )}
      </section>

      <section className="border border-gray-200 rounded p-4 mb-4 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">战役日志</h2>
        <p className="text-sm text-gray-600 mb-3">DM 与玩家均可在此添加日志，所有人可见。</p>
        <div className="space-y-2 mb-4 max-h-48 overflow-auto">
          {campaignLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无日志。</p>
          ) : (
            campaignLogs.map((log) => (
              <div key={log.id} className="border border-gray-100 rounded p-2 bg-slate-50 text-sm text-gray-800 whitespace-pre-wrap">
                <time className="text-gray-500 text-xs block mb-0.5">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </time>
                {log.content}
              </div>
            ))
          )}
        </div>
        <form
          className="flex gap-2 flex-wrap items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newLogContent.trim() || addingLog) return;
            setAddingLog(true);
            api(`/api/campaigns/${id}/logs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: newLogContent.trim() }),
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.log) {
                  setCampaignLogs((prev) => [...prev, data.log]);
                  setNewLogContent('');
                }
              })
              .finally(() => setAddingLog(false));
          }}
        >
          <textarea
            value={newLogContent}
            onChange={(e) => setNewLogContent(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-300 rounded px-3 py-2 min-h-[60px] bg-white text-gray-900 placeholder:text-gray-500 text-sm"
            placeholder="输入日志内容…"
          />
          <button
            type="submit"
            disabled={addingLog || !newLogContent.trim()}
            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50 text-sm"
          >
            {addingLog ? '提交中…' : '添加'}
          </button>
        </form>
      </section>
    </div>
  );
}
