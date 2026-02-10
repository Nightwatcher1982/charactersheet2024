/**
 * 单机内存 SSE 广播器：按 campaignId 维护连接，写事件时向该战役所有连接推送。
 */

type StreamEntry = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  campaignId: string;
};

const streamsByCampaign = new Map<string, Set<StreamEntry>>();

function getSet(campaignId: string): Set<StreamEntry> {
  let set = streamsByCampaign.get(campaignId);
  if (!set) {
    set = new Set();
    streamsByCampaign.set(campaignId, set);
  }
  return set;
}

function remove(entry: StreamEntry): void {
  const set = streamsByCampaign.get(entry.campaignId);
  if (set) {
    set.delete(entry);
    if (set.size === 0) streamsByCampaign.delete(entry.campaignId);
  }
}

/**
 * 注册一个 SSE 连接；signal 中止时自动从 Map 移除。
 */
export function registerStream(
  campaignId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  signal: AbortSignal
): void {
  const entry: StreamEntry = { controller, campaignId };
  getSet(campaignId).add(entry);
  signal?.addEventListener?.('abort', () => remove(entry));
}

/**
 * 向该战役所有 SSE 连接推送一条事件（JSON 序列化，格式 data: {...}\n\n）。
 */
export function broadcast(campaignId: string, event: { type: string; payload: unknown; createdAt?: string }): void {
  const set = streamsByCampaign.get(campaignId);
  if (!set || set.size === 0) return;
  const line = `data: ${JSON.stringify(event)}\n\n`;
  const bytes = new TextEncoder().encode(line);
  const dead: StreamEntry[] = [];
  set.forEach((entry) => {
    try {
      entry.controller.enqueue(bytes);
    } catch {
      dead.push(entry);
    }
  });
  dead.forEach((e) => remove(e));
}
