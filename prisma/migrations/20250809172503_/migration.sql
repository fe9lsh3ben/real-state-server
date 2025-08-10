/*
  Warnings:

  - You are about to drop the column `Price` on the `RealEstateAD` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RealEstateAD" DROP COLUMN "Price",
ADD COLUMN     "Unit_Price" DECIMAL(11,2) NOT NULL DEFAULT 0.0;
