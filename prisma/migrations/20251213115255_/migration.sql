/*
  Warnings:

  - You are about to drop the column `Ad_StartedAt` on the `RealEstateAD` table. All the data in the column will be lost.
  - Added the required column `AD_Title` to the `RealEstateAD` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAD" DROP COLUMN "Ad_StartedAt",
ADD COLUMN     "AD_Title" TEXT NOT NULL;
