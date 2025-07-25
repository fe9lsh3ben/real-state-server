/*
  Warnings:

  - You are about to drop the column `Fal_License` on the `FalLicense` table. All the data in the column will be lost.
  - Added the required column `Fal_License_Number` to the `FalLicense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FalLicense" DROP COLUMN "Fal_License",
ADD COLUMN     "Fal_License_Number" TEXT NOT NULL;
