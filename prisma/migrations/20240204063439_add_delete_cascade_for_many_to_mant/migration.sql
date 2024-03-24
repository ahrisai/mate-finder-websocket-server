-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Maps" DROP CONSTRAINT "Cs2_dataCs2Maps_cs2_dataId_fkey";

-- DropForeignKey
ALTER TABLE "Cs2_dataCs2Roles" DROP CONSTRAINT "Cs2_dataCs2Roles_cs2_dataId_fkey";

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Roles" ADD CONSTRAINT "Cs2_dataCs2Roles_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cs2_dataCs2Maps" ADD CONSTRAINT "Cs2_dataCs2Maps_cs2_dataId_fkey" FOREIGN KEY ("cs2_dataId") REFERENCES "Cs2_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
