const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {generateContractFunction,tokenMiddlewere} = require('../libraries/functions&middlewares_lib');


const Contract = express.Router();


Contract.route('/generate_contracts')
    /** Request's body example: {"Office_ID":234 ,"PartiesConsent"://{GOV ID,Name, SignatureOTP, Phone Number},
    "Contant":{content, contract terms} }
    **/
    .post(tokenMiddlewere,generateContractFunction(prisma))
    .get()
    .delete();




module.exports = {Contract}