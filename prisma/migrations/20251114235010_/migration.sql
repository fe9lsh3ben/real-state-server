/*
  Warnings:

  - You are about to drop the column `Made_By` on the `TermsAndCondition` table. All the data in the column will be lost.
  - Added the required column `Admin_ID` to the `TermsAndCondition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TermsAndCondition" DROP COLUMN "Made_By",
ADD COLUMN     "Admin_ID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."TermsAndCondition" ADD CONSTRAINT "TermsAndCondition_Admin_ID_fkey" FOREIGN KEY ("Admin_ID") REFERENCES "public"."AdministrationUser"("Admin_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
