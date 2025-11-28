/*
  Warnings:

  - The values [BROKERING,MARKETING,PROPERTY_MANAGEMENT,FACILITY_MANAGEMENT,AUCTION_MANAGEMENT,CONSULTING,REAL_ESTATE_ADVERTISING] on the enum `Fal_Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Fal_Type_new" AS ENUM ('BROKERING_AND_MARKITING', 'BROKERING_AND_MARKITING_FOR_VIRTUAL_PLATFORM', 'REAL_ESTATE_ANALYSIS', 'REAL_ESTATE_CONSULTANT');
ALTER TABLE "public"."FalLicense" ALTER COLUMN "License_Type" TYPE "public"."Fal_Type_new" USING ("License_Type"::text::"public"."Fal_Type_new");
ALTER TYPE "public"."Fal_Type" RENAME TO "Fal_Type_old";
ALTER TYPE "public"."Fal_Type_new" RENAME TO "Fal_Type";
DROP TYPE "public"."Fal_Type_old";
COMMIT;
