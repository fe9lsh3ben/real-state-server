const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {
    generate_Contract,
    get_Contract,
    update_Contract,
    delete_Contract,
    tokenMiddlewere} = require('../libraries/functions&middlewares_lib');


const Contract = express.Router();


Contract.route('/contract')
    /** Request's body example: {"Office_ID":234 ,"PartiesConsent"://{GOV ID,Name, SignatureOTP, Phone Number},
    "Contant":{content, contract terms} }
    **/
    .post(tokenMiddlewere,generate_Contract(prisma))
    .get(tokenMiddlewere,get_Contract(prisma))
    .put(tokenMiddlewere,update_Contract(prisma))
    .delete(tokenMiddlewere,delete_Contract(prisma));

 

module.exports = {Contract}