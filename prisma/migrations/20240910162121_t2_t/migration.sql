/*
  Warnings:

  - You are about to drop the column `Contetn` on the `TermsAndCondetions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TermsAndCondetions" DROP COLUMN "Contetn",
ADD COLUMN     "Content" JSONB[];
