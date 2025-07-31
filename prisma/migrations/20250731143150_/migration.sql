/*
  Warnings:

  - A unique constraint covering the columns `[Fal_License_Number]` on the table `FalLicense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_Fal_License_Number_key" ON "FalLicense"("Fal_License_Number");
