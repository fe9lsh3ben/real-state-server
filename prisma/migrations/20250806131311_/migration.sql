/*
  Warnings:

  - A unique constraint covering the columns `[Office_Name]` on the table `RealEstateOffice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_Office_Name_key" ON "public"."RealEstateOffice"("Office_Name");
