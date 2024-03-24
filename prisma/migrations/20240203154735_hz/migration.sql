/*
  Warnings:

  - You are about to drop the `Cs2_dataCs2Maps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cs2_dataCs2Roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cs2_dataId` to the `Cs2Maps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cs2_dataId` to the `Cs2Roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Maps" DROP CONSTRAINT "Cs2_dataCs2Maps_cs2MapId_fkey";

-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Maps" DROP CONSTRAINT "Cs2_dataCs2Maps_cs2_dataId_fkey";

-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Roles" DROP CONSTRAINT "Cs2_dataCs2Roles_cs2RoleId_fkey";

-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Roles" DROP CONSTRAINT "Cs2_dataCs2Roles_cs2_dataId_fkey";

-- AlterTable
ALTER TABLE "Cs2Maps" ADD COLUMN     "cs2_dataId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Cs2Roles" ADD COLUMN     "cs2_dataId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Cs2_dataCs2Maps";

-- DropTable
DROP TABLE "Cs2_dataCs2Roles";

-- AddForeignKey
ALTER TABLE "Cs2Roles" ADD CONSTRAINT "Cs2Roles_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2Maps" ADD CONSTRAINT "Cs2Maps_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
