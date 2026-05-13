/*
  Warnings:

  - The `AD_License` column on the `RealEstateUnit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RealEstateUnit" DROP COLUMN "AD_License",
ADD COLUMN     "AD_License" JSONB;
