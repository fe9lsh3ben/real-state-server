/*
  Warnings:

  - You are about to drop the column `Price` on the `RealEstateAD` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAD" DROP COLUMN "Price",
ALTER COLUMN "Visable_Zoom" DROP NOT NULL,
ALTER COLUMN "Visable_Zoom" DROP DEFAULT;
