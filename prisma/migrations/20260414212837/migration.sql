/*
  Warnings:

  - You are about to drop the column `Owner_ID` on the `FalLicense` table. All the data in the column will be lost.
  - You are about to drop the column `Balance` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `Owner_ID` on the `RealEstateOffice` table. All the data in the column will be lost.
  - You are about to drop the column `Balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Contracts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Employer_REO_ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Gov_ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_OfficeAndLicense` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Commercial_Register]` on the table `RealEstateOffice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Email]` on the table `RealEstateOffice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Office_ID]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Office_ID]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[User_Phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Offcie_ID` to the `FalLicense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `BundleID` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Office_Bundle_Name" AS ENUM ('FREE_BUNDLE', 'ESSENTIAL_BUNDLE', 'ADVANCED_BUNDLE', 'PROFESSIONAL_BUNDLE');

-- DropForeignKey
ALTER TABLE "FalLicense" DROP CONSTRAINT "FalLicense_Owner_ID_fkey";

-- DropForeignKey
ALTER TABLE "RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_Owner_ID_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_Employer_REO_ID_fkey";

-- DropForeignKey
ALTER TABLE "_OfficeAndLicense" DROP CONSTRAINT "_OfficeAndLicense_A_fkey";

-- DropForeignKey
ALTER TABLE "_OfficeAndLicense" DROP CONSTRAINT "_OfficeAndLicense_B_fkey";

-- DropIndex
DROP INDEX "FalLicense_Owner_ID_idx";

-- DropIndex
DROP INDEX "User_Gov_ID_key";

-- AlterTable
ALTER TABLE "FalLicense" DROP COLUMN "Owner_ID",
ADD COLUMN     "Offcie_ID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RealEstateOffice" DROP COLUMN "Balance",
DROP COLUMN "Owner_ID",
ADD COLUMN     "BundleID" INTEGER NOT NULL,
ADD COLUMN     "Comments" JSONB,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Password" TEXT NOT NULL,
ADD COLUMN     "Reset_Token" TEXT;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "Office_ID" INTEGER,
ALTER COLUMN "User_ID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "Office_ID" INTEGER,
ALTER COLUMN "User_ID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Balance",
DROP COLUMN "Contracts",
DROP COLUMN "Employer_REO_ID",
DROP COLUMN "Gov_ID",
ALTER COLUMN "Username" DROP NOT NULL;

-- DropTable
DROP TABLE "_OfficeAndLicense";

-- CreateTable
CREATE TABLE "OfficeSubscriptionBundle" (
    "BundleID" SERIAL NOT NULL,
    "BundleName" "Office_Bundle_Name" NOT NULL,
    "BundleDetails" TEXT NOT NULL,
    "Max_Properties_Limit" INTEGER NOT NULL DEFAULT 7,
    "Max_Properties_Ads" INTEGER NOT NULL DEFAULT 2,
    "Price_Per_Month" DECIMAL(65,30) NOT NULL DEFAULT 49.0,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeSubscriptionBundle_pkey" PRIMARY KEY ("BundleID")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficeSubscriptionBundle_BundleName_key" ON "OfficeSubscriptionBundle"("BundleName");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_Commercial_Register_key" ON "RealEstateOffice"("Commercial_Register");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_Email_key" ON "RealEstateOffice"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_Office_ID_key" ON "RefreshToken"("Office_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Session_Office_ID_key" ON "Session"("Office_ID");

-- CreateIndex
CREATE UNIQUE INDEX "User_User_Phone_key" ON "User"("User_Phone");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_BundleID_fkey" FOREIGN KEY ("BundleID") REFERENCES "OfficeSubscriptionBundle"("BundleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FalLicense" ADD CONSTRAINT "FalLicense_Offcie_ID_fkey" FOREIGN KEY ("Offcie_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
