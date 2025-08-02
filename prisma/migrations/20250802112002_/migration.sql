/*
  Warnings:

  - You are about to drop the column `Ad_Initiator` on the `RealEStateAD` table. All the data in the column will be lost.
  - Added the required column `AD_Initiator` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_Ad_Initiator_fkey";

-- DropIndex
DROP INDEX "FalLicense_Office_ID_key";

-- DropIndex
DROP INDEX "RealEStateAD_Ad_Initiator_key";

-- DropIndex
DROP INDEX "RealEStateAD_RealEstate_ID_key";

-- DropIndex
DROP INDEX "RealEstateOffice_Owner_ID_key";

-- AlterTable
ALTER TABLE "RealEStateAD" DROP COLUMN "Ad_Initiator",
ADD COLUMN     "AD_Initiator" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_AD_Initiator_fkey" FOREIGN KEY ("AD_Initiator") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
