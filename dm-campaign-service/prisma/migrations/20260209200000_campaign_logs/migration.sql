-- CreateTable
CREATE TABLE "CampaignLogEntry" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignLogEntry_campaignId_idx" ON "CampaignLogEntry"("campaignId");

-- AddForeignKey
ALTER TABLE "CampaignLogEntry" ADD CONSTRAINT "CampaignLogEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
