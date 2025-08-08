/*
  Warnings:

  - You are about to drop the column `License_Number` on the `FalLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Fal_License_Number]` on the table `FalLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Fal_License_Number` to the `FalLicense` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."FalLicense_License_Number_key";

-- AlterTable
ALTER TABLE "public"."FalLicense" DROP COLUMN "License_Number",
ADD COLUMN     "Fal_License_Number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_Fal_License_Number_key" ON "public"."FalLicense"("Fal_License_Number");
