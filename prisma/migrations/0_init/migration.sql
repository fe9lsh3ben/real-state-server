-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'REAL_ESTATE_OFFICE_OWNER', 'REAL_ESTATE_OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERMENTAL_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeOrUserStatus" AS ENUM ('IN_HOLD', 'ACTIVE', 'UNACTIVE', 'TEMP_UNACTIVE', 'RESTRICTED', 'BANNED');

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('LAND', 'BAUILDING', 'APARTMENT', 'VILLA', 'STORE', 'AGRICULTURAL', 'STORAGE', 'OFFICE', 'EXHIBITION', 'OTHER');

-- CreateEnum
CREATE TYPE "Committed_By" AS ENUM ('OFFICE_OWNER', 'OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY');

-- CreateTable
CREATE TABLE "Setting" (
    "ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "ID" SERIAL NOT NULL,
    "UserId" INTEGER,
    "Action" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "TermsAndCondetions" (
    "ID" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Content" JSONB[],
    "Other" JSONB[],
    "CommittedBy" "Committed_By" NOT NULL,
    "MadeBy" TEXT NOT NULL,

    CONSTRAINT "TermsAndCondetions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Session" (
    "ID" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "User" (
    "ID" SERIAL NOT NULL,
    "Role" "UserType" NOT NULL DEFAULT 'BENEFICIARY',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "TermsCondetionID" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "ProfileImage" BYTEA,
    "GovID" TEXT NOT NULL,
    "Address" JSONB,
    "FullName" TEXT[],
    "UserPhone" TEXT NOT NULL,
    "Other1" JSONB[],
    "Employer_REO_ID" INTEGER,
    "FalLicense" TEXT,
    "Balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "UserStatus" "OfficeOrUserStatus",

    CONSTRAINT "User_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateOffice" (
    "ID" SERIAL NOT NULL,
    "CommercialRegister" TEXT NOT NULL,
    "OwnerID" INTEGER NOT NULL,
    "Address" JSONB NOT NULL,
    "Status" "OfficeOrUserStatus" NOT NULL,
    "Visitors" JSONB,
    "Balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateOffice_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEstateUnit" (
    "ID" SERIAL NOT NULL,
    "UnitType" "RealEstateType" NOT NULL,
    "DeedNumber" TEXT NOT NULL,
    "DeedDate" TIMESTAMP(3) NOT NULL,
    "DeedOwners" JSONB[],
    "AffiliatedOfficeID" INTEGER,
    "Initiator" JSONB NOT NULL,
    "Address" JSONB NOT NULL,
    "UnitImages" BYTEA[],
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Specifications" JSONB[],

    CONSTRAINT "RealEstateUnit_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Contract" (
    "ID" SERIAL NOT NULL,
    "InitiatorOffice" INTEGER NOT NULL,
    "PartiesConsent" JSONB[],
    "Contant" JSONB NOT NULL,
    "Other" JSONB[],
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEStateAD" (
    "ID" SERIAL NOT NULL,
    "Ad_Initiator" INTEGER NOT NULL,
    "Ad_License" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "RealEstateID" INTEGER NOT NULL,
    "AdContent" JSONB NOT NULL,
    "Ad_StartedAt" TIMESTAMP(3) NOT NULL,
    "Ad_Expiry" TIMESTAMP(3) NOT NULL,
    "Hedden" BOOLEAN NOT NULL,

    CONSTRAINT "RealEStateAD_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Name_key" ON "Setting"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_UserId_key" ON "Session"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_Token_key" ON "Session"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_GovID_key" ON "User"("GovID");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_refreshToken_key" ON "RefreshToken"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_OwnerID_key" ON "RealEstateOffice"("OwnerID");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateUnit_DeedNumber_key" ON "RealEstateUnit"("DeedNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_Ad_Initiator_key" ON "RealEStateAD"("Ad_Initiator");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_RealEstateID_key" ON "RealEStateAD"("RealEstateID");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetionID_fkey" FOREIGN KEY ("TermsCondetionID") REFERENCES "TermsAndCondetions"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_Employer_REO_ID_fkey" FOREIGN KEY ("Employer_REO_ID") REFERENCES "RealEstateOffice"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateUnit" ADD CONSTRAINT "RealEstateUnit_AffiliatedOfficeID_fkey" FOREIGN KEY ("AffiliatedOfficeID") REFERENCES "RealEstateOffice"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_InitiatorOffice_fkey" FOREIGN KEY ("InitiatorOffice") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Ad_Initiator_fkey" FOREIGN KEY ("Ad_Initiator") REFERENCES "RealEstateOffice"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstateID_fkey" FOREIGN KEY ("RealEstateID") REFERENCES "RealEstateUnit"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

