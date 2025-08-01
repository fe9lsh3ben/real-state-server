/*
  Warnings:

  - The primary key for the `FalLicense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `FalLicense` table. All the data in the column will be lost.
  - The primary key for the `RealEstateUnit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `REU_ID` on the `RealEstateUnit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_RealEstate_ID_fkey";

-- AlterTable
ALTER TABLE "FalLicense" DROP CONSTRAINT "FalLicense_pkey",
DROP COLUMN "ID",
ADD COLUMN     "License_ID" SERIAL NOT NULL,
ADD CONSTRAINT "FalLicense_pkey" PRIMARY KEY ("License_ID");

-- AlterTable
ALTER TABLE "RealEstateUnit" DROP CONSTRAINT "RealEstateUnit_pkey",
DROP COLUMN "REU_ID",
ADD COLUMN     "Unit_ID" SERIAL NOT NULL,
ADD CONSTRAINT "RealEstateUnit_pkey" PRIMARY KEY ("Unit_ID");

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstate_ID_fkey" FOREIGN KEY ("RealEstate_ID") REFERENCES "RealEstateUnit"("Unit_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
