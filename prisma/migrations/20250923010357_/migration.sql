/*
  Warnings:

  - The primary key for the `DeletionLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deletdAt` on the `DeletionLog` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `DeletionLog` table. All the data in the column will be lost.
  - You are about to drop the column `logID` on the `DeletionLog` table. All the data in the column will be lost.
  - You are about to drop the column `recordID` on the `DeletionLog` table. All the data in the column will be lost.
  - You are about to drop the column `tableName` on the `DeletionLog` table. All the data in the column will be lost.
  - Added the required column `Deleted_By` to the `DeletionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Record_ID` to the `DeletionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Table_Name` to the `DeletionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DeletionLog" DROP CONSTRAINT "DeletionLog_pkey",
DROP COLUMN "deletdAt",
DROP COLUMN "deletedBy",
DROP COLUMN "logID",
DROP COLUMN "recordID",
DROP COLUMN "tableName",
ADD COLUMN     "Deletd_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Deleted_By" TEXT NOT NULL,
ADD COLUMN     "Log_ID" SERIAL NOT NULL,
ADD COLUMN     "Record_ID" INTEGER NOT NULL,
ADD COLUMN     "Table_Name" TEXT NOT NULL,
ADD CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("Log_ID");
