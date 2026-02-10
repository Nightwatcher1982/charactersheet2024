import { NextRequest, NextResponse } from 'next/server';
import { getCampaignAndAuth } from '@/lib/campaign-auth';
import { prisma } from '@/lib/prisma';

export async function getEncounterAndAuth(
  request: NextRequest,
  campaignId: string,
  encounterId: string
) {
  const result = await getCampaignAndAuth(request, campaignId);
  if (result instanceof NextResponse) return result;
  const encounter = await prisma.encounter.findFirst({
    where: { id: encounterId, campaignId },
    include: { entries: true },
  });
  if (!encounter) {
    return NextResponse.json(
      { error: '遭遇不存在', code: 'encounter_not_found' },
      { status: 404 }
    );
  }
  return { ...result, encounter };
}
