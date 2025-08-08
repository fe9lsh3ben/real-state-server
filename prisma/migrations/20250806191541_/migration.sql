-- DropForeignKey
ALTER TABLE "public"."RealEstateOffice" DROP CONSTRAINT "RealEstateOffice_License_ID_fkey";

-- AddForeignKey
ALTER TABLE "public"."RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_License_ID_fkey" FOREIGN KEY ("License_ID") REFERENCES "public"."FalLicense"("License_ID") ON DELETE SET NULL ON UPDATE CASCADE;
