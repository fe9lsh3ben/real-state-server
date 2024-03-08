/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[GovID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TermsCondetion_ID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UpdatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserPhone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OFFICE_OWNER', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERMENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeStatus" AS ENUM ('ACTIVE', 'UNACTIVE', 'TEMP_UNACTIVE', 'RESTRICTED', 'BANNED');

-- CreateEnum
CREATE TYPE "RealStateType" AS ENUM ('LAND', 'BAUILDING', 'VILLA', 'STORE', 'AGRICULTURAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InitiatorRelation" AS ENUM ('OWNER', 'REPRESNTATIVE', 'OFFICE');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'UNACTIVE');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "Address" JSONB NOT NULL,
ADD COLUMN     "Balance" DECIMAL(65,30),
ADD COLUMN     "BrokerLicense" TEXT,
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "FalLicense" TEXT,
ADD COLUMN     "FullName" TEXT[],
ADD COLUMN     "GovID" TEXT,
ADD COLUMN     "ID" SERIAL NOT NULL,
ADD COLUMN     "Other1" JSONB[],
ADD COLUMN     "ProfileImage" BYTEA,
ADD COLUMN     "Role" "Role" NOT NULL DEFAULT 'BENEFICIARY',
ADD COLUMN     "TermsCondetion_ID" TEXT NOT NULL,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "UserPhone" TEXT NOT NULL,
ADD COLUMN     "Username" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("ID");

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Session" (
    "ID" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Setting" (
    "ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "ID" SERIAL NOT NULL,
    "UserId" INTEGER,
    "Action" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEstateOffice" (
    "ID" SERIAL NOT NULL,
    "CommercialRegister" TEXT NOT NULL,
    "OwnerID" INTEGER NOT NULL,
    "Region" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "Address" JSONB NOT NULL,
    "Status" "OfficeStatus" NOT NULL,
    "Visitors" INTEGER NOT NULL,
    "Balance" DECIMAL(65,30) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "TearmsAndAgreements" BOOLEAN NOT NULL,

    CONSTRAINT "RealEstateOffice_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEstateUnit" (
    "ID" SERIAL NOT NULL,
    "UnitType" "RealStateType" NOT NULL,
    "DeedNumber" TEXT NOT NULL,
    "DeedDate" TIMESTAMP(3) NOT NULL,
    "DeedOwner" JSONB[],
    "InitiatedBy" TEXT NOT NULL,
    "InitiatorID" TEXT NOT NULL,
    "InitiatorRelation" "InitiatorRelation" NOT NULL,
    "CreatorContactNumber" TEXT NOT NULL,
    "Region" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "Address" JSONB NOT NULL,
    "UnitImage" BYTEA[],
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Description" JSONB[],
    "TermsAndAgreements" BOOLEAN NOT NULL,

    CONSTRAINT "RealEstateUnit_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Contract" (
    "ID" INTEGER NOT NULL,
    "InitiatorOffice" INTEGER NOT NULL,
    "PartiesConsent" JSONB[],
    "Contant" TEXT NOT NULL,
    "PartiesPhone" JSONB[],
    "Other" JSONB[],
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "TermsAndCondetion" JSONB[],

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Bargain" (
    "ID" INTEGER NOT NULL,
    "InitiatorOffice" INTEGER NOT NULL,
    "PartiesConsent" JSONB[],
    "Contant" TEXT NOT NULL,
    "PartiesPhone" JSONB[],
    "Other" JSONB[],
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "TermsAndCondetion" JSONB[],

    CONSTRAINT "Bargain_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "OfficeStaff" (
    "ID" SERIAL NOT NULL,
    "GovID" TEXT NOT NULL,
    "BrokageLicense" TEXT NOT NULL,
    "StaffRecords" JSONB[],
    "OfficeID" INTEGER,

    CONSTRAINT "OfficeStaff_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEStateAD" (
    "ID" SERIAL NOT NULL,
    "AD_Maker" INTEGER NOT NULL,
    "AD_License" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "RealEstate" INTEGER NOT NULL,
    "Content" JSONB NOT NULL,
    "Expiry" TIMESTAMP(3) NOT NULL,
    "TermsAndCondetion" JSONB NOT NULL,

    CONSTRAINT "RealEStateAD_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "_OfficeAndREUnitRelation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_UserId_key" ON "Session"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_Token_key" ON "Session"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Name_key" ON "Setting"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_OwnerID_key" ON "RealEstateOffice"("OwnerID");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateUnit_DeedNumber_key" ON "RealEstateUnit"("DeedNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_AD_Maker_key" ON "RealEStateAD"("AD_Maker");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_RealEstate_key" ON "RealEStateAD"("RealEstate");

-- CreateIndex
CREATE UNIQUE INDEX "_OfficeAndREUnitRelation_AB_unique" ON "_OfficeAndREUnitRelation"("A", "B");

-- CreateIndex
CREATE INDEX "_OfficeAndREUnitRelation_B_index" ON "_OfficeAndREUnitRelation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_GovID_key" ON "User"("GovID");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_InitiatorOffice_fkey" FOREIGN KEY ("InitiatorOffice") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bargain" ADD CONSTRAINT "Bargain_InitiatorOffice_fkey" FOREIGN KEY ("InitiatorOffice") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeStaff" ADD CONSTRAINT "OfficeStaff_OfficeID_fkey" FOREIGN KEY ("OfficeID") REFERENCES "RealEstateOffice"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_AD_Maker_fkey" FOREIGN KEY ("AD_Maker") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstate_fkey" FOREIGN KEY ("RealEstate") REFERENCES "RealEstateUnit"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfficeAndREUnitRelation" ADD CONSTRAINT "_OfficeAndREUnitRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "RealEstateOffice"("ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfficeAndREUnitRelation" ADD CONSTRAINT "_OfficeAndREUnitRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "RealEstateUnit"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
