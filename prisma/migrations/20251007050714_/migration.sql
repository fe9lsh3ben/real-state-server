/*
  Warnings:

  - Added the required column `Office_Banner_Image` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Made the column `Office_Image` on table `RealEstateOffice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateOffice" ADD COLUMN     "Office_Banner_Image" BYTEA NOT NULL,
ALTER COLUMN "Office_Image" SET NOT NULL;
