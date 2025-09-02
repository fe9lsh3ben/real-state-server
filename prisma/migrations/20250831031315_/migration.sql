-- CreateEnum
CREATE TYPE "public"."Note_Type" AS ENUM ('REQUEST', 'QUERY');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "Note_ID" SERIAL NOT NULL,
    "Sender_ID" INTEGER NOT NULL,
    "Note_Type" "public"."Note_Type" NOT NULL,
    "Content" TEXT NOT NULL,
    "Read" BOOLEAN NOT NULL DEFAULT false,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Office_ID" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("Note_ID")
);

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_Office_ID_fkey" FOREIGN KEY ("Office_ID") REFERENCES "public"."RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
