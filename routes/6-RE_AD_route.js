const { express } = require('../libraries/utilities');
const { prisma, } = require('../libraries/prisma_utilities');
const { officeAuthentication,
    falLicenseAuthentication,
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
.post(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, generate_READ(prisma, ))
    
    
.get(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, get_READ(prisma))
    
    
.put(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, edit_READ(prisma))
    
    
.delete(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, delete_READ(prisma));


module.exports = { RE_AD }