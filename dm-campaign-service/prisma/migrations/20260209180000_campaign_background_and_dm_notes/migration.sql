-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "backgroundIntro" TEXT,
ADD COLUMN "backgroundImageUrl" TEXT;

-- CreateTable
CREATE TABLE "CampaignDmNote" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignDmNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignDmNote_campaignId_idx" ON "CampaignDmNote"("campaignId");

-- AddForeignKey
ALTER TABLE "CampaignDmNote" ADD CONSTRAINT "CampaignDmNote_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
