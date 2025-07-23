const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {
    generate_READ,
    get_READ, 
    edit_READ, 
    delete_READ,
    tokenMiddlewere} = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/real_estate_ad')
    
    /**Request's body example: {
    "Initiator": 234 ,"AdLicense" :"3454533" ,"RealEstate" : 346 ,
    "AdContent":{Type of estate,Description, Price, Other},
    "AdStartedAt" 2025-01-12 : ,"AdExpiry":  2026-01-12
    } */

    
    .post(tokenMiddlewere,generate_READ(prisma))
    .get(tokenMiddlewere, get_READ(prisma))
    .put(tokenMiddlewere, edit_READ(prisma))
    .delete(tokenMiddlewere, delete_READ(prisma));


module.exports = {RE_AD}