/*
  Warnings:

  - You are about to drop the column `FalLicense_ID` on the `RealEstateOffice` table. All the data in the column will be lost.
  - Added the required column `License_ID` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_FalLicense_ID_fkey";

-- AlterTable
ALTER TABLE "public"."RealEstateOffice" DROP COLUMN "FalLicense_ID",
ADD COLUMN     "License_ID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_License_ID_fkey" FOREIGN KEY ("License_ID") REFERENCES "public"."FalLicense"("License_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
