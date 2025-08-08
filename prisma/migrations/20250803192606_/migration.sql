/*
  Warnings:

  - You are about to drop the `RealEStateAD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermsAndCondetions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_Office_ID_fkey";

-- DropForeignKey
ALTER TABLE "RealEStateAD" DROP CONSTRAINT "RealEStateAD_Unit_ID_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_TermsCondetion_ID_fkey";

-- DropTable
DROP TABLE "RealEStateAD";

-- DropTable
DROP TABLE "TermsAndCondetions";

-- CreateTable
CREATE TABLE "TermsAndConditions" (
    "TC_ID" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Content" JSONB[],
    "Other" JSONB[],
    "Committed_By" "Committed_By" NOT NULL,
    "Made_By" TEXT NOT NULL,

    CONSTRAINT "TermsAndConditions_pkey" PRIMARY KEY ("TC_ID")
);

-- CreateTable
CREATE TABLE "RealEstateAD" (
    "AD_ID" SERIAL NOT NULL,
    "Office_ID" INTEGER NOT NULL,
    "Initiator" JSONB NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Unit_ID" INTEGER NOT NULL,
    "AD_Type" "AD_Type" NOT NULL,
    "AD_Unit_Type" "RealEstateType" NOT NULL,
    "Indoor_Unit_Images" BYTEA[],
    "AD_Content" JSONB NOT NULL,
    "Ad_StartedAt" TIMESTAMP(3) NOT NULL,
    "Ad_Expiry" TIMESTAMP(3) NOT NULL,
    "Hedden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RealEstateAD_pkey" PRIMARY KEY ("AD_ID")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetion_ID_fkey" FOREIGN KEY ("TermsCondetion_ID") REFERENCES "TermsAndConditions"("TC_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAD" ADD CONSTRAINT "RealEstateAD_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAD" ADD CONSTRAINT "RealEstateAD_Unit_ID_fkey" FOREIGN KEY ("Unit_ID") REFERENCES "RealEstateUnit"("Unit_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
