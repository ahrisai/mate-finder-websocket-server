/*
  Warnings:

  - You are about to drop the column `cs2_dataId` on the `Cs2Maps` table. All the data in the column will be lost.
  - You are about to drop the column `cs2_dataId` on the `Cs2Roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Cs2Maps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Cs2Roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Cs2Maps" DROP CONSTRAINT "Cs2Maps_cs2_dataId_fkey";

-- DropForeignKey
ALTER TABLE "Cs2Roles" DROP CONSTRAINT "Cs2Roles_cs2_dataId_fkey";

-- AlterTable
ALTER TABLE "Cs2Maps" DROP COLUMN "cs2_dataId";

-- AlterTable
ALTER TABLE "Cs2Roles" DROP COLUMN "cs2_dataId";

-- CreateTable
CREATE TABLE "Cs2_dataCs2Roles" (
    "cs2_dataId" INTEGER NOT NULL,
    "cs2RoleId" INTEGER NOT NULL,

    CONSTRAINT "Cs2_dataCs2Roles_pkey" PRIMARY KEY ("cs2_dataId","cs2RoleId")
);

-- CreateTable
CREATE TABLE "Cs2_dataCs2Maps" (
    "cs2_dataId" INTEGER NOT NULL,
    "cs2MapId" INTEGER NOT NULL,

    CONSTRAINT "Cs2_dataCs2Maps_pkey" PRIMARY KEY ("cs2_dataId","cs2MapId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cs2Maps_name_key" ON "Cs2Maps"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cs2Roles_name_key" ON "Cs2Roles"("name");

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Roles" ADD CONSTRAINT "Cs2_dataCs2Roles_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Roles" ADD CONSTRAINT "Cs2_dataCs2Roles_cs2RoleId_fkey" FOREIGN KEY ("cs2RoleId") REFERENCES "Cs2Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Maps" ADD CONSTRAINT "Cs2_dataCs2Maps_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Maps" ADD CONSTRAINT "Cs2_dataCs2Maps_cs2MapId_fkey" FOREIGN KEY ("cs2MapId") REFERENCES "Cs2Maps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
