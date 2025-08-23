/*
  Warnings:

  - Added the required column `Subject` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "Subject" TEXT NOT NULL;
