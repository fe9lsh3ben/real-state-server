/*
  Warnings:

  - You are about to drop the column `License_ID` on the `RealEstateOffice` table. All the data in the column will be lost.
  - Added the required column `FalLicense_ID` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_License_ID_fkey";

-- AlterTable
ALTER TABLE "public"."RealEstateOffice" DROP COLUMN "License_ID",
ADD COLUMN     "FalLicense_ID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_FalLicense_ID_fkey" FOREIGN KEY ("FalLicense_ID") REFERENCES "public"."FalLicense"("License_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
