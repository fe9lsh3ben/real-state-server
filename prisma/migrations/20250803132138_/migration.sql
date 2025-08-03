/*
  Warnings:

  - You are about to drop the column `RealEstate_ID` on the `RealEStateAD` table. All the data in the column will be lost.
  - Added the required column `Unit_ID` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_RealEstate_ID_fkey";

-- AlterTable
ALTER TABLE "RealEStateAD" DROP COLUMN "RealEstate_ID",
ADD COLUMN     "Unit_ID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Unit_ID_fkey" FOREIGN KEY ("Unit_ID") REFERENCES "RealEstateUnit"("Unit_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
