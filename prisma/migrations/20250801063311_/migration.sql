/*
  Warnings:

  - Added the required column `Initiator` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RealEstateUnit" ADD COLUMN     "Initiator" JSONB NOT NULL;
