const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {generateRE_ADFunction, tokenMiddlewere} = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/generate_READ')
    
    /**Request's body example: {
    "Initiator": 234 ,"AdLicense" :"3454533" ,"RealEstate" : 346 ,
    "AdContent":{Type of estate,Description, Price, Other},
    "AdStartedAt" 2025-01-12 : ,"AdExpiry":  2026-01-12
    }
     */
    .post(tokenMiddlewere,generateRE_ADFunction(prisma))
    .put()
    .get()
    .delete();




module.exports = {RE_AD}