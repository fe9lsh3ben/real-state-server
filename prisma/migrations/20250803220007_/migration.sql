/*
  Warnings:

  - You are about to drop the column `Direction` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `District` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Latitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Longitude` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "Direction",
DROP COLUMN "District",
DROP COLUMN "Latitude",
DROP COLUMN "Longitude";
