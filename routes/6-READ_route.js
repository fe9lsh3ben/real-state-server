const { express } = require('../libraries/utilities');
const { prisma, Real_Estate_Unit_Type, AD_Type} = require('../libraries/prisma_utilities');
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
const { REU } = require('./5-RE_unit_route');


const RE_AD = express.Router();


RE_AD.route('/real_estate_ad')

    /**Request's body example: {
    "Initiator": 234 ,"AdLicense" :"3454533" ,"RealEstate" : 346 ,
    "AdContent":{Type of estate,Description, Price, Other},
    "AdStartedAt" 2025-01-12 : ,"AdExpiry":  2026-01-12
    } */


    .post(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, generate_READ(prisma, Real_Estate_Unit_Type, AD_Type))
    .get(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, get_READ(prisma))
    .put(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, edit_READ(prisma))
    .delete(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, REUAuthentication, delete_READ(prisma));


module.exports = { RE_AD }