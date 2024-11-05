/*
  Warnings:

  - A unique constraint covering the columns `[UserId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_UserId_key" ON "RefreshToken"("UserId");
