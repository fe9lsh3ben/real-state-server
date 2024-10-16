/*
  Warnings:

  - The primary key for the `RefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[RefreshToken]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ExpiresAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `RefreshToken` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "RefreshToken_refreshToken_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "refreshToken",
DROP COLUMN "userId",
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ID" SERIAL NOT NULL,
ADD COLUMN     "RefreshToken" TEXT NOT NULL,
ADD COLUMN     "UserId" INTEGER NOT NULL,
ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("ID");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_RefreshToken_key" ON "RefreshToken"("RefreshToken");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
