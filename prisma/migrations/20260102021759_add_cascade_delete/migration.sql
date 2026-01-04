-- DropForeignKey
ALTER TABLE "RealEstateAD" DROP CONSTRAINT "RealEstateAD_Unit_ID_fkey";

-- AddForeignKey
ALTER TABLE "RealEstateAD" ADD CONSTRAINT "RealEstateAD_Unit_ID_fkey" FOREIGN KEY ("Unit_ID") REFERENCES "RealEstateUnit"("Unit_ID") ON DELETE CASCADE ON UPDATE CASCADE;
