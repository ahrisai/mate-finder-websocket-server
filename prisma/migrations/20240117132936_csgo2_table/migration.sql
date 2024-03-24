/*
  Warnings:

  - You are about to drop the `ValorantData` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hs` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kd` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lvlImg` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matches` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steamId` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winrate` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wins` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ValorantData" DROP CONSTRAINT "ValorantData_userId_fkey";

-- AlterTable
ALTER TABLE "Csgo_data" ADD COLUMN     "hs" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "kd" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lvlImg" TEXT NOT NULL,
ADD COLUMN     "matches" INTEGER NOT NULL,
ADD COLUMN     "steamId" TEXT NOT NULL,
ADD COLUMN     "winrate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "wins" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ValorantData";

-- CreateTable
CREATE TABLE "Valorant_Data" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Valorant_Data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Valorant_Data_userId_key" ON "Valorant_Data"("userId");

-- AddForeignKey
ALTER TABLE "Valorant_Data" ADD CONSTRAINT "Valorant_Data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
