/*
  Warnings:

  - You are about to drop the column `steamId` on the `Csgo_data` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Csgo_data` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userSteamId]` on the table `Csgo_data` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[steamId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,userId]` on the table `Valorant_Data` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userSteamId` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Csgo_data" DROP CONSTRAINT "Csgo_data_userId_fkey";

-- DropIndex
DROP INDEX "Csgo_data_userId_key";

-- AlterTable
ALTER TABLE "Csgo_data" DROP COLUMN "steamId",
DROP COLUMN "userId",
ADD COLUMN     "userSteamId" TEXT NOT NULL;

-- AlterTable
CREATE SEQUENCE team_id_seq;
ALTER TABLE "Team" ALTER COLUMN "id" SET DEFAULT nextval('team_id_seq'),
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE team_id_seq OWNED BY "Team"."id";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "steamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Csgo_data_userSteamId_key" ON "Csgo_data"("userSteamId");

-- CreateIndex
CREATE UNIQUE INDEX "User_steamId_key" ON "User"("steamId");

-- CreateIndex
CREATE UNIQUE INDEX "Valorant_Data_id_userId_key" ON "Valorant_Data"("id", "userId");

-- AddForeignKey
ALTER TABLE "Csgo_data" ADD CONSTRAINT "Csgo_data_userSteamId_fkey" FOREIGN KEY ("userSteamId") REFERENCES "User"("steamId") ON DELETE CASCADE ON UPDATE CASCADE;
