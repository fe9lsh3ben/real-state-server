-- CreateTable
CREATE TABLE "public"."DeletionLog" (
    "logID" SERIAL NOT NULL,
    "recordID" INTEGER NOT NULL,
    "tableName" TEXT NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "deletdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("logID")
);
