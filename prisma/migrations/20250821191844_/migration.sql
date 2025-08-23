/*
  Warnings:

  - You are about to drop the column `Contant` on the `Contract` table. All the data in the column will be lost.
  - Added the required column `Content` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contract" DROP COLUMN "Contant",
ADD COLUMN     "Content" JSONB NOT NULL;
