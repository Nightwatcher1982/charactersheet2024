-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "currentTurnIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitiativeEntry" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "characterId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "initiativeBonus" INTEGER NOT NULL DEFAULT 0,
    "currentInitiative" INTEGER,
    "hp" INTEGER,
    "maxHp" INTEGER,
    "ac" INTEGER,
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InitiativeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Encounter_campaignId_idx" ON "Encounter"("campaignId");

-- CreateIndex
CREATE INDEX "InitiativeEntry_encounterId_idx" ON "InitiativeEntry"("encounterId");

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeEntry" ADD CONSTRAINT "InitiativeEntry_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
