/*
  Warnings:

  - You are about to drop the column `REU_License` on the `RealEstateUnit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RealEstateUnit" DROP COLUMN "REU_License",
ADD COLUMN     "AD_License" TEXT;
