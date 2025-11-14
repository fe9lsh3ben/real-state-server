/*
  Warnings:

  - You are about to drop the column `UserID` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[User_ID]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `User_ID` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_UserID_fkey";

-- DropIndex
DROP INDEX "public"."RefreshToken_UserID_key";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "UserID",
ADD COLUMN     "User_ID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_User_ID_key" ON "public"."RefreshToken"("User_ID");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "public"."User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
