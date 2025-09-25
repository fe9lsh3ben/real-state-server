/*
  Warnings:

  - You are about to drop the column `Created_At` on the `RefreshToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "Created_At",
ADD COLUMN     "Revoked_At" TIMESTAMP(3),
ALTER COLUMN "Refresh_Token" DROP NOT NULL,
ALTER COLUMN "Expires_At" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "Revoked_At" TIMESTAMP(3),
ALTER COLUMN "Token" DROP NOT NULL,
ALTER COLUMN "Expires_At" DROP NOT NULL;
