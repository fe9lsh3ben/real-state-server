-- CreateTable
CREATE TABLE "public"."AdministrationUser" (
    "Admin_ID" SERIAL NOT NULL,
    "Gov_ID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdministrationUser_pkey" PRIMARY KEY ("Admin_ID")
);
