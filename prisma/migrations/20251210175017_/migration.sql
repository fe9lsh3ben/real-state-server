/*
  Warnings:

  - Added the required column `Price` to the `RealEstateAD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAD" ADD COLUMN     "Price" DECIMAL(65,30) NOT NULL;
