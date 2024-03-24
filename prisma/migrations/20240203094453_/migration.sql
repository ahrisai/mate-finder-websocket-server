/*
  Warnings:

  - You are about to drop the `Csgo_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Csgo_data" DROP CONSTRAINT "Csgo_data_userId_fkey";

-- DropTable
DROP TABLE "Csgo_data";

-- CreateTable
CREATE TABLE "Cs2_data" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "steamId" TEXT NOT NULL,
    "matches" INTEGER NOT NULL,
    "winrate" DOUBLE PRECISION NOT NULL,
    "kd" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "hs" DOUBLE PRECISION NOT NULL,
    "lvlImg" TEXT NOT NULL,
    "elo" INTEGER NOT NULL,

    CONSTRAINT "Cs2_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cs2Roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Cs2Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cs2Maps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Cs2Maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Csgo_dataCs2Roles" (
    "cs2_dataId" INTEGER NOT NULL,
    "cs2RoleId" INTEGER NOT NULL,

    CONSTRAINT "Csgo_dataCs2Roles_pkey" PRIMARY KEY ("cs2_dataId","cs2RoleId")
);

-- CreateTable
CREATE TABLE "Csgo_dataCs2Maps" (
    "cs2_dataId" INTEGER NOT NULL,
    "cs2MapId" INTEGER NOT NULL,

    CONSTRAINT "Csgo_dataCs2Maps_pkey" PRIMARY KEY ("cs2_dataId","cs2MapId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cs2_data_userId_key" ON "Cs2_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cs2Roles_name_key" ON "Cs2Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cs2Maps_name_key" ON "Cs2Maps"("name");

-- AddForeignKey
ALTER TABLE "Cs2_data" ADD CONSTRAINT "Cs2_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csgo_dataCs2Roles" ADD CONSTRAINT "Csgo_dataCs2Roles_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csgo_dataCs2Roles" ADD CONSTRAINT "Csgo_dataCs2Roles_cs2RoleId_fkey" FOREIGN KEY ("cs2RoleId") REFERENCES "Cs2Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csgo_dataCs2Maps" ADD CONSTRAINT "Csgo_dataCs2Maps_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Csgo_dataCs2Maps" ADD CONSTRAINT "Csgo_dataCs2Maps_cs2MapId_fkey" FOREIGN KEY ("cs2MapId") REFERENCES "Cs2Maps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
