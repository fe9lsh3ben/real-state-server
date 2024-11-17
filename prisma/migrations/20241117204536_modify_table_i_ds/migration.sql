/*
  Warnings:

  - The primary key for the `AuditTrail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `AuditTrail` table. All the data in the column will be lost.
  - The primary key for the `Contract` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `Contract` table. All the data in the column will be lost.
  - The primary key for the `RealEStateAD` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `RealEStateAD` table. All the data in the column will be lost.
  - The primary key for the `RealEstateOffice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `OwnerID` on the `RealEstateOffice` table. All the data in the column will be lost.
  - The primary key for the `RealEstateUnit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `RealEstateUnit` table. All the data in the column will be lost.
  - The primary key for the `RefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `RefreshToken` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `Session` table. All the data in the column will be lost.
  - The primary key for the `Setting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `Setting` table. All the data in the column will be lost.
  - The primary key for the `TermsAndCondetions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `TermsAndCondetions` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ID` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Owner_ID]` on the table `RealEstateOffice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Owner_ID` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TC_ID` to the `TermsAndCondetions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_InitiatorOffice_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_Ad_Initiator_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_RealEstateID_fkey";

-- DropForeignKey
ALTER TABLE "RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_OwnerID_fkey";

-- DropForeignKey
ALTER TABLE "RealEstateUnit" DROP CONSTRAINT "RealEstateUnit_AffiliatedOfficeID_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_UserId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_Employer_REO_ID_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_TermsCondetionID_fkey";

-- DropIndex
DROP INDEX "RealEstateOffice_OwnerID_key";

-- AlterTable
ALTER TABLE "AuditTrail" DROP CONSTRAINT "AuditTrail_pkey",
DROP COLUMN "ID",
ADD COLUMN     "AT_ID" SERIAL NOT NULL,
ADD CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("AT_ID");

-- AlterTable
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_pkey",
DROP COLUMN "ID",
ADD COLUMN     "Contract_ID" SERIAL NOT NULL,
ADD CONSTRAINT "Contract_pkey" PRIMARY KEY ("Contract_ID");

-- AlterTable
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_pkey",
DROP COLUMN "ID",
ADD COLUMN     "AD_ID" SERIAL NOT NULL,
ALTER COLUMN "Hedden" SET DEFAULT false,
ADD CONSTRAINT "RealEStateAD_pkey" PRIMARY KEY ("AD_ID");

-- AlterTable
ALTER TABLE "RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_pkey",
DROP COLUMN "ID",
DROP COLUMN "OwnerID",
ADD COLUMN     "Office_ID" SERIAL NOT NULL,
ADD COLUMN     "Owner_ID" INTEGER NOT NULL,
ADD CONSTRAINT "RealEstateOffice_pkey" PRIMARY KEY ("Office_ID");

-- AlterTable
ALTER TABLE "RealEstateUnit" DROP CONSTRAINT "RealEstateUnit_pkey",
DROP COLUMN "ID",
ADD COLUMN     "REU_ID" SERIAL NOT NULL,
ADD CONSTRAINT "RealEstateUnit_pkey" PRIMARY KEY ("REU_ID");

-- AlterTable
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_pkey",
DROP COLUMN "ID",
ADD COLUMN     "RToken_ID" SERIAL NOT NULL,
ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("RToken_ID");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "ID",
ADD COLUMN     "SToken_ID" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("SToken_ID");

-- AlterTable
ALTER TABLE "Setting" DROP CONSTRAINT "Setting_pkey",
DROP COLUMN "ID",
ADD COLUMN     "Setting_ID" SERIAL NOT NULL,
ADD CONSTRAINT "Setting_pkey" PRIMARY KEY ("Setting_ID");

-- AlterTable
ALTER TABLE "TermsAndCondetions" DROP CONSTRAINT "TermsAndCondetions_pkey",
DROP COLUMN "ID",
ADD COLUMN     "TC_ID" TEXT NOT NULL,
ADD CONSTRAINT "TermsAndCondetions_pkey" PRIMARY KEY ("TC_ID");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "ID",
ADD COLUMN     "User_ID" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("User_ID");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_Owner_ID_key" ON "RealEstateOffice"("Owner_ID");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetionID_fkey" FOREIGN KEY ("TermsCondetionID") REFERENCES "TermsAndCondetions"("TC_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_Employer_REO_ID_fkey" FOREIGN KEY ("Employer_REO_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_Owner_ID_fkey" FOREIGN KEY ("Owner_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateUnit" ADD CONSTRAINT "RealEstateUnit_AffiliatedOfficeID_fkey" FOREIGN KEY ("AffiliatedOfficeID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_InitiatorOffice_fkey" FOREIGN KEY ("InitiatorOffice") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Ad_Initiator_fkey" FOREIGN KEY ("Ad_Initiator") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstateID_fkey" FOREIGN KEY ("RealEstateID") REFERENCES "RealEstateUnit"("REU_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
