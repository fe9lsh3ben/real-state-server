/*
  Warnings:

  - You are about to drop the column `PartiesPhone` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `TermsAndCondetion` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `AD_Maker` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `Content` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `Expiry` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `RealEstate` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `TermsAndCondetion` on the `RealEStateAD` table. All the data in the column will be lost.
  - You are about to drop the column `City` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `Region` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `TearmsAndAgreements` on the `RealEstateOffice` table. All the data in the column will be lost.
  - The `Visitors` column on the `RealEstateOffice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `City` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `CreatorContactNumber` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `DeedOwner` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `InitiatedBy` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `InitiatorID` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `InitiatorRelation` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `Region` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `TermsAndAgreements` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `UnitImage` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `BrokerLicense` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `TermsCondetion_ID` on the `User` table. All the data in the column will be lost.
  - The `Role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Bargain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OfficeStaff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OfficeAndREUnitRelation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[AD_Initiator]` on the table `RealEStateAD` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RealEstate_ID]` on the table `RealEStateAD` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `Contant` on the `Contract` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `AD_Expiry` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AD_Initiator` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AD_StartedAt` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Ad_Content` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Hedden` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RealEstate_ID` to the `RealEStateAD` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `Status` on the `RealEstateOffice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `Initiator` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `UnitType` on the `RealEstateUnit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `TermsCondetionID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `Balance` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `GovID` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'REAL_ESTATE_OFFICE_OWNER', 'REAL_ESTATE_OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERMENTAL_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeOrUserStatus" AS ENUM ('IN_HOLD', 'ACTIVE', 'UNACTIVE', 'TEMP_UNACTIVE', 'RESTRICTED', 'BANNED');

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('LAND', 'BAUILDING', 'APARTMENT', 'VILLA', 'STORE', 'AGRICULTURAL', 'STORAGE', 'OFFICE', 'EXHIBITION', 'OTHER');

-- CreateEnum
CREATE TYPE "Committed_By" AS ENUM ('OFFICE_OWNER', 'OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY');

-- DropForeignKey
ALTER TABLE "Bargain" DROP CONSTRAINT "Bargain_InitiatorOffice_fkey";

-- DropForeignKey
ALTER TABLE "OfficeStaff" DROP CONSTRAINT "OfficeStaff_OfficeID_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_AD_Maker_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_RealEstate_fkey";

-- DropForeignKey
ALTER TABLE "_OfficeAndREUnitRelation" DROP CONSTRAINT "_OfficeAndREUnitRelation_A_fkey";

-- DropForeignKey
ALTER TABLE "_OfficeAndREUnitRelation" DROP CONSTRAINT "_OfficeAndREUnitRelation_B_fkey";

-- DropIndex
DROP INDEX "RealEStateAD_AD_Maker_key";

-- DropIndex
DROP INDEX "RealEStateAD_RealEstate_key";

-- AlterTable
CREATE SEQUENCE contract_id_seq;
ALTER TABLE "Contract" DROP COLUMN "PartiesPhone",
DROP COLUMN "TermsAndCondetion",
ALTER COLUMN "ID" SET DEFAULT nextval('contract_id_seq'),
DROP COLUMN "Contant",
ADD COLUMN     "Contant" JSONB NOT NULL,
ALTER COLUMN "CreatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER SEQUENCE contract_id_seq OWNED BY "Contract"."ID";

-- AlterTable
ALTER TABLE "RealEStateAD" DROP COLUMN "AD_Maker",
DROP COLUMN "Content",
DROP COLUMN "Expiry",
DROP COLUMN "RealEstate",
DROP COLUMN "TermsAndCondetion",
ADD COLUMN     "AD_Expiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "AD_Initiator" INTEGER NOT NULL,
ADD COLUMN     "AD_StartedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Ad_Content" JSONB NOT NULL,
ADD COLUMN     "Hedden" BOOLEAN NOT NULL,
ADD COLUMN     "RealEstate_ID" INTEGER NOT NULL,
ALTER COLUMN "CreatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RealEstateOffice" DROP COLUMN "City",
DROP COLUMN "Region",
DROP COLUMN "TearmsAndAgreements",
DROP COLUMN "Status",
ADD COLUMN     "Status" "OfficeOrUserStatus" NOT NULL,
DROP COLUMN "Visitors",
ADD COLUMN     "Visitors" JSONB,
ALTER COLUMN "Balance" SET DEFAULT 0.0,
ALTER COLUMN "CreatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RealEstateUnit" DROP COLUMN "City",
DROP COLUMN "CreatorContactNumber",
DROP COLUMN "DeedOwner",
DROP COLUMN "Description",
DROP COLUMN "InitiatedBy",
DROP COLUMN "InitiatorID",
DROP COLUMN "InitiatorRelation",
DROP COLUMN "Region",
DROP COLUMN "TermsAndAgreements",
DROP COLUMN "UnitImage",
ADD COLUMN     "AffiliatedOfficeID" INTEGER,
ADD COLUMN     "DeedOwners" JSONB[],
ADD COLUMN     "Initiator" JSONB NOT NULL,
ADD COLUMN     "Specifications" JSONB[],
ADD COLUMN     "UnitImages" BYTEA[],
DROP COLUMN "UnitType",
ADD COLUMN     "UnitType" "RealEstateType" NOT NULL,
ALTER COLUMN "CreatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "BrokerLicense",
DROP COLUMN "TermsCondetion_ID",
ADD COLUMN     "Employer_REO_ID" INTEGER,
ADD COLUMN     "TermsCondetionID" TEXT NOT NULL,
ADD COLUMN     "UserStatus" "OfficeOrUserStatus",
ALTER COLUMN "Address" DROP NOT NULL,
ALTER COLUMN "Balance" SET NOT NULL,
ALTER COLUMN "Balance" SET DEFAULT 0.0,
ALTER COLUMN "GovID" SET NOT NULL,
DROP COLUMN "Role",
ADD COLUMN     "Role" "UserType" NOT NULL DEFAULT 'BENEFICIARY';

-- DropTable
DROP TABLE "Bargain";

-- DropTable
DROP TABLE "OfficeStaff";

-- DropTable
DROP TABLE "_OfficeAndREUnitRelation";

-- DropEnum
DROP TYPE "InitiatorRelation";

-- DropEnum
DROP TYPE "OfficeStatus";

-- DropEnum
DROP TYPE "RealStateType";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "StaffStatus";

-- CreateTable
CREATE TABLE "TermsAndCondetions" (
    "ID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Contetn" JSONB[],
    "Other" JSONB[],
    "commetedBy" "Committed_By" NOT NULL,
    "MadeBy" TEXT NOT NULL,

    CONSTRAINT "TermsAndCondetions_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_AD_Initiator_key" ON "RealEStateAD"("AD_Initiator");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_RealEstate_ID_key" ON "RealEStateAD"("RealEstate_ID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetionID_fkey" FOREIGN KEY ("TermsCondetionID") REFERENCES "TermsAndCondetions"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_Employer_REO_ID_fkey" FOREIGN KEY ("Employer_REO_ID") REFERENCES "RealEstateOffice"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateUnit" ADD CONSTRAINT "RealEstateUnit_AffiliatedOfficeID_fkey" FOREIGN KEY ("AffiliatedOfficeID") REFERENCES "RealEstateOffice"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_AD_Initiator_fkey" FOREIGN KEY ("AD_Initiator") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstate_ID_fkey" FOREIGN KEY ("RealEstate_ID") REFERENCES "RealEstateUnit"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
