/*
  Warnings:

  - You are about to drop the column `License_ID` on the `RealEstateOffice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_License_ID_fkey";

-- AlterTable
ALTER TABLE "public"."RealEstateOffice" DROP COLUMN "License_ID";

-- CreateTable
CREATE TABLE "public"."_OfficeAndLicense" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OfficeAndLicense_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OfficeAndLicense_B_index" ON "public"."_OfficeAndLicense"("B");

-- AddForeignKey
ALTER TABLE "public"."_OfficeAndLicense" ADD CONSTRAINT "_OfficeAndLicense_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."FalLicense"("License_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OfficeAndLicense" ADD CONSTRAINT "_OfficeAndLicense_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."RealEstateOffice"("Office_ID") ON DELETE CASCADE ON UPDATE CASCADE;
