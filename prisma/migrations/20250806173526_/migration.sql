/*
  Warnings:

  - You are about to drop the column `Office_ID` on the `FalLicense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_License_ID_fkey";

-- DropIndex
DROP INDEX "public"."FalLicense_Office_ID_idx";

-- AlterTable
ALTER TABLE "public"."FalLicense" DROP COLUMN "Office_ID";

-- AlterTable
ALTER TABLE "public"."RealEstateOffice" ALTER COLUMN "License_ID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_License_ID_fkey" FOREIGN KEY ("License_ID") REFERENCES "public"."FalLicense"("License_ID") ON DELETE SET NULL ON UPDATE CASCADE;
