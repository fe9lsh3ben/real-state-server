/*
  Warnings:

  - You are about to drop the column `Office_Services` on the `RealEstateOffice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateOffice" DROP COLUMN "Office_Services",
ADD COLUMN     "Other" JSONB;
