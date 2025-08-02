/*
  Warnings:

  - A unique constraint covering the columns `[Office_ID]` on the table `FalLicense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Fal_Type" AS ENUM ('BROKERING', 'MARKETING', 'PROPERTY_MANAGEMENT', 'FACILITY_MANAGEMENT', 'AUCTION_MANAGEMENT', 'CONSULTING', 'REAL_ESTATE_ADVERTISING');

-- AlterTable
ALTER TABLE "FalLicense" ADD COLUMN     "FalType" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_Office_ID_key" ON "FalLicense"("Office_ID");
