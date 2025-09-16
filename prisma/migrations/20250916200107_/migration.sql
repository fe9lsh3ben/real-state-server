/*
  Warnings:

  - Changed the type of `Content` on the `TermsAndCondition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."TermsAndCondition" DROP COLUMN "Content",
ADD COLUMN     "Content" JSONB NOT NULL;
