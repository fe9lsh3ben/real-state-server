/*
  Warnings:

  - Added the required column `TermsCondetion_ID` to the `RealEstateOffice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateOffice" ADD COLUMN     "TermsCondetion_ID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_TermsCondetion_ID_fkey" FOREIGN KEY ("TermsCondetion_ID") REFERENCES "public"."TermsAndCondition"("TC_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
