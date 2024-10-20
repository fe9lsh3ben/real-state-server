
const {
    PrismaClient,
    Prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By } = require('@prisma/client');




const prisma = new PrismaClient();


module.exports = {
    prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By}