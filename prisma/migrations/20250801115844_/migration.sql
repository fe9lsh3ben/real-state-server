/*
  Warnings:

  - You are about to drop the column `RealEstateOfficeID` on the `FalLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Office_ID]` on the table `FalLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Office_ID` to the `FalLicense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FalLicense" DROP CONSTRAINT "FalLicense_RealEstateOfficeID_fkey";

-- DropIndex
DROP INDEX "FalLicense_RealEstateOfficeID_key";

-- AlterTable
ALTER TABLE "FalLicense" DROP COLUMN "RealEstateOfficeID",
ADD COLUMN     "Office_ID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_Office_ID_key" ON "FalLicense"("Office_ID");

-- AddForeignKey
ALTER TABLE "FalLicense" ADD CONSTRAINT "FalLicense_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
