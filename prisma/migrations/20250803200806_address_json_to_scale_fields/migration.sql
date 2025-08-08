/*
  Warnings:

  - The values [UNACTIVE,TEMP_UNACTIVE] on the enum `OfficeOrUserStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [BAUILDING] on the enum `RealEstateType` will be removed. If these variants are still used in the database, this will fail.
  - The values [GOVERMENTAL_AGENT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `CreatedAt` on the `AuditTrail` table. All the data in the column will be lost.
  - You are about to drop the column `Address` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `Address` on the `RealEstateUnit` table. All the data in the column will be lost.
  - You are about to drop the column `Address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TermsAndConditions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `City` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Direction` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `District` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Latitude` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Longitude` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Region` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `City` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Direction` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `District` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Latitude` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Longitude` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Region` to the `RealEstateUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `City` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Direction` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `District` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Latitude` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Longitude` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Region` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('NORTH', 'SOUTH', 'EAST', 'WEST');

-- AlterEnum
BEGIN;
CREATE TYPE "OfficeOrUserStatus_new" AS ENUM ('IN_HOLD', 'ACTIVE', 'INACTIVE', 'TEMP_INACTIVE', 'RESTRICTED', 'BANNED');
ALTER TABLE "User" ALTER COLUMN "User_Status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "User_Status" TYPE "OfficeOrUserStatus_new" USING ("User_Status"::text::"OfficeOrUserStatus_new");
ALTER TABLE "RealEstateOffice" ALTER COLUMN "Status" TYPE "OfficeOrUserStatus_new" USING ("Status"::text::"OfficeOrUserStatus_new");
ALTER TYPE "OfficeOrUserStatus" RENAME TO "OfficeOrUserStatus_old";
ALTER TYPE "OfficeOrUserStatus_new" RENAME TO "OfficeOrUserStatus";
DROP TYPE "OfficeOrUserStatus_old";
ALTER TABLE "User" ALTER COLUMN "User_Status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RealEstateType_new" AS ENUM ('LAND', 'BUILDING', 'APARTMENT', 'VILLA', 'STORE', 'FARM', 'CORRAL', 'STORAGE', 'OFFICE', 'SHOWROOM', 'OTHER');
ALTER TABLE "RealEstateUnit" ALTER COLUMN "Unit_Type" TYPE "RealEstateType_new" USING ("Unit_Type"::text::"RealEstateType_new");
ALTER TABLE "RealEstateAD" ALTER COLUMN "AD_Unit_Type" TYPE "RealEstateType_new" USING ("AD_Unit_Type"::text::"RealEstateType_new");
ALTER TYPE "RealEstateType" RENAME TO "RealEstateType_old";
ALTER TYPE "RealEstateType_new" RENAME TO "RealEstateType";
DROP TYPE "RealEstateType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('ADMIN', 'REAL_ESTATE_OFFICE_OWNER', 'REAL_ESTATE_OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERNMENTAL_AGENT', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "Role" TYPE "UserType_new" USING ("Role"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
ALTER TABLE "User" ALTER COLUMN "Role" SET DEFAULT 'BENEFICIARY';
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_TermsCondetion_ID_fkey";

-- AlterTable
ALTER TABLE "AuditTrail" DROP COLUMN "CreatedAt",
ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RealEstateOffice" DROP COLUMN "Address",
ADD COLUMN     "City" TEXT NOT NULL,
ADD COLUMN     "Direction" "Direction" NOT NULL,
ADD COLUMN     "District" TEXT NOT NULL,
ADD COLUMN     "Latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Longitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Region" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RealEstateUnit" DROP COLUMN "Address",
ADD COLUMN     "City" TEXT NOT NULL,
ADD COLUMN     "Direction" "Direction" NOT NULL,
ADD COLUMN     "District" TEXT NOT NULL,
ADD COLUMN     "Latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Longitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Region" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Address",
ADD COLUMN     "City" TEXT NOT NULL,
ADD COLUMN     "Direction" "Direction" NOT NULL,
ADD COLUMN     "District" TEXT NOT NULL,
ADD COLUMN     "Latitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Longitude" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "Region" TEXT NOT NULL;

-- DropTable
DROP TABLE "TermsAndConditions";

-- CreateTable
CREATE TABLE "TermsAndCondition" (
    "TC_ID" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Content" JSONB[],
    "Other" JSONB[],
    "Committed_By" "Committed_By" NOT NULL,
    "Made_By" TEXT NOT NULL,

    CONSTRAINT "TermsAndCondition_pkey" PRIMARY KEY ("TC_ID")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetion_ID_fkey" FOREIGN KEY ("TermsCondetion_ID") REFERENCES "TermsAndCondition"("TC_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
