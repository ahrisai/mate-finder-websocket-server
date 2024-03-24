/*
  Warnings:

  - You are about to drop the column `userSteamId` on the `Csgo_data` table. All the data in the column will be lost.
  - You are about to drop the column `steamId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Csgo_data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `steamId` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Csgo_data" DROP CONSTRAINT "Csgo_data_userSteamId_fkey";

-- DropIndex
DROP INDEX "Csgo_data_userSteamId_key";

-- DropIndex
DROP INDEX "Team_id_userId_key";

-- DropIndex
DROP INDEX "User_steamId_key";

-- DropIndex
DROP INDEX "Valorant_Data_id_userId_key";

-- AlterTable
ALTER TABLE "Csgo_data" DROP COLUMN "userSteamId",
ADD COLUMN     "steamId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "steamId";

-- CreateIndex
CREATE UNIQUE INDEX "Csgo_data_userId_key" ON "Csgo_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_userId_key" ON "Team"("userId");

-- AddForeignKey
ALTER TABLE "Csgo_data" ADD CONSTRAINT "Csgo_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
