-- AlterTable: 预留爱发电对接字段（afdianUserId、memberExpiresAt）
ALTER TABLE "User" ADD COLUMN "afdianUserId" TEXT;
ALTER TABLE "User" ADD COLUMN "memberExpiresAt" TIMESTAMP(3);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "User_afdianUserId_key" ON "User"("afdianUserId");

-- CreateIndex
CREATE INDEX "User_afdianUserId_idx" ON "User"("afdianUserId");
