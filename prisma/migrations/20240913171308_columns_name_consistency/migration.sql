/*
  Warnings:

  - You are about to drop the column `AD_Expiry` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `AD_Initiator` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `AD_License` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `AD_StartedAt` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `Ad_Content` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `RealEstate_ID` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `commetedBy` on the `TermsAndCondetions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Ad_Initiator]` on the table `RealEStateAD` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RealEstateID]` on the table `RealEStateAD` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `AdContent` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ad_Expiry` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ad_Initiator` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ad_License` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ad_StartedAt` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RealEstateID` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CommitedBy` to the `TermsAndCondetions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_AD_Initiator_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_RealEstate_ID_fkey";

-- DropIndex
DROP INDEX "RealEStateAD_AD_Initiator_key";

-- DropIndex
DROP INDEX "RealEStateAD_RealEstate_ID_key";

-- AlterTable
ALTER TABLE "RealEStateAD" DROP COLUMN "AD_Expiry",
DROP COLUMN "AD_Initiator",
DROP COLUMN "AD_License",
DROP COLUMN "AD_StartedAt",
DROP COLUMN "Ad_Content",
DROP COLUMN "RealEstate_ID",
ADD COLUMN     "AdContent" JSONB NOT NULL,
ADD COLUMN     "Ad_Expiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Ad_Initiator" INTEGER NOT NULL,
ADD COLUMN     "Ad_License" TEXT NOT NULL,
ADD COLUMN     "Ad_StartedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "RealEstateID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TermsAndCondetions" DROP COLUMN "commetedBy",
ADD COLUMN     "CommitedBy" "Committed_By" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_Ad_Initiator_key" ON "RealEStateAD"("Ad_Initiator");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_RealEstateID_key" ON "RealEStateAD"("RealEstateID");

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Ad_Initiator_fkey" FOREIGN KEY ("Ad_Initiator") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstateID_fkey" FOREIGN KEY ("RealEstateID") REFERENCES "RealEstateUnit"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
