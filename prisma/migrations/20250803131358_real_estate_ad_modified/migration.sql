/*
  Warnings:

  - You are about to drop the column `AD_Initiator` on the `RealEStateAD` table. All the data in the column will be lost.
  - Added the required column `Initiator` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Office_ID` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_AD_Initiator_fkey";

-- AlterTable
ALTER TABLE "RealEStateAD" DROP COLUMN "AD_Initiator",
ADD COLUMN     "Initiator" JSONB NOT NULL,
ADD COLUMN     "Office_ID" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "FalLicense_Office_ID_idx" ON "FalLicense"("Office_ID");

-- CreateIndex
CREATE INDEX "FalLicense_Owner_ID_idx" ON "FalLicense"("Owner_ID");

-- CreateIndex
CREATE INDEX "FalLicense_License_Type_idx" ON "FalLicense"("License_Type");

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
