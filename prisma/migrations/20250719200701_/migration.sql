-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'REAL_ESTATE_OFFICE_OWNER', 'REAL_ESTATE_OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY', 'GOVERMENTAL_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeOrUserStatus" AS ENUM ('IN_HOLD', 'ACTIVE', 'UNACTIVE', 'TEMP_UNACTIVE', 'RESTRICTED', 'BANNED');

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('LAND', 'BAUILDING', 'APARTMENT', 'VILLA', 'STORE', 'FARM', 'CORRAL', 'STORAGE', 'OFFICE', 'SHOWROOM', 'OTHER');

-- CreateEnum
CREATE TYPE "Committed_By" AS ENUM ('OFFICE_OWNER', 'OFFICE_STAFF', 'BENEFICIARY', 'BUSINESS_BENEFICIARY');

-- CreateEnum
CREATE TYPE "AD_Type" AS ENUM ('RENT', 'SELL', 'INVESTMENT', 'SERVICE');

-- CreateTable
CREATE TABLE "Setting" (
    "Setting_ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("Setting_ID")
);

-- CreateTable
CREATE TABLE "AuditTrail" (
    "AT_ID" SERIAL NOT NULL,
    "User_ID" INTEGER,
    "Action" TEXT NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("AT_ID")
);

-- CreateTable
CREATE TABLE "TermsAndCondetions" (
    "TC_ID" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Content" JSONB[],
    "Other" JSONB[],
    "Committed_By" "Committed_By" NOT NULL,
    "Made_By" TEXT NOT NULL,

    CONSTRAINT "TermsAndCondetions_pkey" PRIMARY KEY ("TC_ID")
);

-- CreateTable
CREATE TABLE "Session" (
    "SToken_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "Expires_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("SToken_ID")
);

-- CreateTable
CREATE TABLE "User" (
    "User_ID" SERIAL NOT NULL,
    "Role" "UserType" NOT NULL DEFAULT 'BENEFICIARY',
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "TermsCondetion_ID" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Profile_Image" BYTEA,
    "Gov_ID" TEXT NOT NULL,
    "Address" JSONB,
    "Full_Name" TEXT[],
    "User_Phone" TEXT NOT NULL,
    "Other1" JSONB[],
    "Employer_REO_ID" INTEGER,
    "Balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "User_Status" "OfficeOrUserStatus" DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "RToken_ID" SERIAL NOT NULL,
    "Refresh_Token" TEXT NOT NULL,
    "UserID" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Expires_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("RToken_ID")
);

-- CreateTable
CREATE TABLE "RealEstateOffice" (
    "Office_ID" SERIAL NOT NULL,
    "Commercial_Register" TEXT NOT NULL,
    "Owner_ID" INTEGER NOT NULL,
    "Office_Name" TEXT NOT NULL,
    "Office_Phone" TEXT NOT NULL,
    "Office_Image" BYTEA,
    "Address" JSONB NOT NULL,
    "Status" "OfficeOrUserStatus" NOT NULL,
    "Visitors" JSONB,
    "Balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateOffice_pkey" PRIMARY KEY ("Office_ID")
);

-- CreateTable
CREATE TABLE "FalLicense" (
    "ID" SERIAL NOT NULL,
    "Fal_License" TEXT NOT NULL,
    "Expiry_Date" TIMESTAMP(3) NOT NULL,
    "RealEstateOfficeID" INTEGER NOT NULL,

    CONSTRAINT "FalLicense_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "RealEstateUnit" (
    "REU_ID" SERIAL NOT NULL,
    "Unit_Type" "RealEstateType" NOT NULL,
    "RE_Name" TEXT NOT NULL,
    "Deed_Number" TEXT NOT NULL,
    "Deed_Date" TIMESTAMP(3) NOT NULL,
    "Deed_Owners" JSONB[],
    "Affiliated_Office_ID" INTEGER,
    "Initiator" JSONB NOT NULL,
    "Address" JSONB NOT NULL,
    "Outdoor_Unit_Images" BYTEA[],
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "Polygon" POLYGON,
    "Specifications" JSONB NOT NULL,

    CONSTRAINT "RealEstateUnit_pkey" PRIMARY KEY ("REU_ID")
);

-- CreateTable
CREATE TABLE "Contract" (
    "Contract_ID" SERIAL NOT NULL,
    "Initiator_Office" INTEGER NOT NULL,
    "Parties_Consent" JSONB[],
    "Contant" JSONB NOT NULL,
    "Other" JSONB NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("Contract_ID")
);

-- CreateTable
CREATE TABLE "RealEStateAD" (
    "AD_ID" SERIAL NOT NULL,
    "Ad_Initiator" INTEGER NOT NULL,
    "Ad_License" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3) NOT NULL,
    "RealEstate_ID" INTEGER NOT NULL,
    "AD_Type" "AD_Type" NOT NULL,
    "AD_Unit_Type" "RealEstateType" NOT NULL,
    "Indoor_Unit_Images" BYTEA[],
    "AD_Content" JSONB NOT NULL,
    "Ad_StartedAt" TIMESTAMP(3) NOT NULL,
    "Ad_Expiry" TIMESTAMP(3) NOT NULL,
    "Hedden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RealEStateAD_pkey" PRIMARY KEY ("AD_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Name_key" ON "Setting"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_User_ID_key" ON "Session"("User_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Session_Token_key" ON "Session"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "User_Username_key" ON "User"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Gov_ID_key" ON "User"("Gov_ID");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_Refresh_Token_key" ON "RefreshToken"("Refresh_Token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_UserID_key" ON "RefreshToken"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateOffice_Owner_ID_key" ON "RealEstateOffice"("Owner_ID");

-- CreateIndex
CREATE UNIQUE INDEX "FalLicense_RealEstateOfficeID_key" ON "FalLicense"("RealEstateOfficeID");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateUnit_Deed_Number_key" ON "RealEstateUnit"("Deed_Number");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_Ad_Initiator_key" ON "RealEStateAD"("Ad_Initiator");

-- CreateIndex
CREATE UNIQUE INDEX "RealEStateAD_RealEstate_ID_key" ON "RealEStateAD"("RealEstate_ID");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_TermsCondetion_ID_fkey" FOREIGN KEY ("TermsCondetion_ID") REFERENCES "TermsAndCondetions"("TC_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_Employer_REO_ID_fkey" FOREIGN KEY ("Employer_REO_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_Owner_ID_fkey" FOREIGN KEY ("Owner_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FalLicense" ADD CONSTRAINT "FalLicense_RealEstateOfficeID_fkey" FOREIGN KEY ("RealEstateOfficeID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateUnit" ADD CONSTRAINT "RealEstateUnit_Affiliated_Office_ID_fkey" FOREIGN KEY ("Affiliated_Office_ID") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_Initiator_Office_fkey" FOREIGN KEY ("Initiator_Office") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_Ad_Initiator_fkey" FOREIGN KEY ("Ad_Initiator") REFERENCES "RealEstateOffice"("Office_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEStateAD" ADD CONSTRAINT "RealEStateAD_RealEstate_ID_fkey" FOREIGN KEY ("RealEstate_ID") REFERENCES "RealEstateUnit"("REU_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
