/*
  Warnings:

  - You are about to drop the `Csgo_dataCs2Maps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Csgo_dataCs2Roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Csgo_dataCs2Maps" DROP CONSTRAINT "Csgo_dataCs2Maps_cs2MapId_fkey";

-- DropForeignKey
ALTER TABLE "Csgo_dataCs2Maps" DROP CONSTRAINT "Csgo_dataCs2Maps_cs2_dataId_fkey";

-- DropForeignKey
ALTER TABLE "Csgo_dataCs2Roles" DROP CONSTRAINT "Csgo_dataCs2Roles_cs2RoleId_fkey";

-- DropForeignKey
ALTER TABLE "Csgo_dataCs2Roles" DROP CONSTRAINT "Csgo_dataCs2Roles_cs2_dataId_fkey";

-- DropTable
DROP TABLE "Csgo_dataCs2Maps";

-- DropTable
DROP TABLE "Csgo_dataCs2Roles";

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

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Roles" ADD CONSTRAINT "Cs2_dataCs2Roles_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Roles" ADD CONSTRAINT "Cs2_dataCs2Roles_cs2RoleId_fkey" FOREIGN KEY ("cs2RoleId") REFERENCES "Cs2Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Maps" ADD CONSTRAINT "Cs2_dataCs2Maps_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Maps" ADD CONSTRAINT "Cs2_dataCs2Maps_cs2MapId_fkey" FOREIGN KEY ("cs2MapId") REFERENCES "Cs2Maps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
