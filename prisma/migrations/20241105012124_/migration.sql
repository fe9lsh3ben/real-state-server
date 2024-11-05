/*
  Warnings:

  - Added the required column `OfficeName` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RealEstateOffice" ADD COLUMN     "OfficeImage" BYTEA,
ADD COLUMN     "OfficeName" TEXT NOT NULL;
