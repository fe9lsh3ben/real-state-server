/*
  Warnings:

  - Changed the type of `Owner_ID` on the `FalLicense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."FalLicense" DROP COLUMN "Owner_ID",
ADD COLUMN     "Owner_ID" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "FalLicense_Owner_ID_idx" ON "public"."FalLicense"("Owner_ID");

-- AddForeignKey
ALTER TABLE "public"."FalLicense" ADD CONSTRAINT "FalLicense_Owner_ID_fkey" FOREIGN KEY ("Owner_ID") REFERENCES "public"."User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
