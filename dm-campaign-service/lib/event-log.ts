import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/event-broadcaster';

export type EventPayload = Record<string, unknown>;

/**
 * 写入战役事件并推送到该战役的所有 SSE 连接
 */
export async function appendEvent(
  campaignId: string,
  type: string,
  payload: EventPayload
): Promise<void> {
  const event = await prisma.campaignEvent.create({
    data: { campaignId, type, payload: payload as object },
  });
  const item = {
    type: event.type,
    payload: event.payload as object,
    createdAt: event.createdAt.toISOString(),
  };
  broadcast(campaignId, { ...item, id: event.id });
}
