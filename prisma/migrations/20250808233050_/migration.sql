/*
  Warnings:

  - You are about to drop the column `AD_Content` on the `RealEstateAD` table. All the data in the column will be lost.
  - Added the required column `AD_Specifications` to the `RealEstateAD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAD" DROP COLUMN "AD_Content",
ADD COLUMN     "AD_Specifications" JSONB NOT NULL;
