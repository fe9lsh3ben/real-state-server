const { express } = require('../libraries/utilities');
const { prisma, AD_Type } = require('../libraries/prisma_utilities');
const { officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication
} = require('../middlewares/authentications');

const {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
    tokenMiddlewere } = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/')

    /**Request's body example: {
    "Initiator": "3" ,"RealEstate" :"3" ,"AD_Type" : "RENT" ,
    "AD_Unit_Type": "APARTMENT" ,
    "AD_Content":{
    "Area" : "300 m" , "Ready" : "yes"},
    "AdStartedAt": "2025-01-12"  ,"AdExpiry":  "2026-12-31",
    "Office_ID": "3"
    } */
.post(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, generate_READ(prisma))
    
    
.get(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, get_READ(prisma, AD_Type))
    
    
.put(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, edit_READ(prisma))
    
    
.delete(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, delete_READ(prisma));


module.exports = { RE_AD }