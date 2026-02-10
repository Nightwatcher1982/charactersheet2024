import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth, getCampaignAndAuthWithToken } from '@/lib/campaign-auth';
import { registerStream } from '@/lib/event-broadcaster';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/events/stream?token= - SSE 流，连接后接收该战役的新事件
 * EventSource 无法带 Header，支持 query 传 token。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  const result = tokenFromQuery
    ? await getCampaignAndAuthWithToken(campaignId, tokenFromQuery)
    : await getCampaignAndAuth(request, campaignId);
  if (result instanceof NextResponse) return result;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      registerStream(campaignId, controller, request.signal);
      controller.enqueue(new TextEncoder().encode(': connected\n\n'));
    },
    cancel() {
      // 断开时由 signal abort 触发移除，此处可不重复处理
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-cache',
      Connection: 'keep-alive',
    },
  });
}
