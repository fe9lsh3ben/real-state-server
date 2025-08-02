/*
  Warnings:

  - You are about to drop the column `FalType` on the `FalLicense` table. All the data in the column will be lost.
  - You are about to drop the column `Fal_License_Number` on the `FalLicense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[License_Number]` on the table `FalLicense` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Issue_Date` to the `FalLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `License_Number` to the `FalLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `License_Type` to the `FalLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Owner_ID` to the `FalLicense` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FalLicense_Fal_License_Number_key";

-- DropIndex
DROP INDEX "FalLicense_Office_ID_key";

-- AlterTable
ALTER TABLE "FalLicense" DROP COLUMN "FalType",
DROP COLUMN "Fal_License_Number",
ADD COLUMN     "Issue_Date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "License_Number" TEXT NOT NULL,
ADD COLUMN     "License_Type" "Fal_Type" NOT NULL,
ADD COLUMN     "Owner_ID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_License_Number_key" ON "FalLicense"("License_Number");
