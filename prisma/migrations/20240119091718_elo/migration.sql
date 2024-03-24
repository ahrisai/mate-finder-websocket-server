/*
  Warnings:

  - Added the required column `elo` to the `Csgo_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Csgo_data" ADD COLUMN     "elo" INTEGER NOT NULL;
