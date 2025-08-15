/*
  Warnings:

  - You are about to drop the column `Initiator_Office` on the `Contract` table. All the data in the column will be lost.
  - Added the required column `Office_ID` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Contract" DROP CONSTRAINT "Contract_Initiator_Office_fkey";

-- AlterTable
ALTER TABLE "public"."Contract" DROP COLUMN "Initiator_Office",
ADD COLUMN     "Office_ID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "public"."RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
