/*
  Warnings:

  - The values [ADMIN] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `Privilege` to the `AdministrationUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AdminPrivilege" AS ENUM ('FULL', 'PARTIAL', 'LIMITED', 'MONITOR');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserType_new" AS ENUM ('REAL_ESTATE_OFFICE_OWNER', 'MULTY_REAL_ESTATE_OFFICE_OWNER', 'REAL_ESTATE_OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERNMENTAL_AGENT', 'OTHER');
ALTER TABLE "public"."User" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "Role" TYPE "public"."UserType_new" USING ("Role"::text::"public"."UserType_new");
ALTER TYPE "public"."UserType" RENAME TO "UserType_old";
ALTER TYPE "public"."UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
ALTER TABLE "public"."User" ALTER COLUMN "Role" SET DEFAULT 'BENEFICIARY';
COMMIT;

-- AlterTable
ALTER TABLE "public"."AdministrationUser" ADD COLUMN     "Privilege" "public"."AdminPrivilege" NOT NULL;
