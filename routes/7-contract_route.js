const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {
    generate_Contract,
    get_Contract,
    delete_Contract,
    tokenMiddlewere} = require('../libraries/functions&middlewares_lib');

const { officeAuthentication, contractAuthentication } = require('../middlewares/authentications');



const Contract = express.Router();


Contract.route('/contract')
    /** Request's body example: {"Office_ID":234 ,"PartiesConsent"://{GOV ID,Name, SignatureOTP, Phone Number},
    "Contant":{content, contract terms} }
    **/
    .post(tokenMiddlewere, officeAuthentication, generate_Contract(prisma))
    .get(tokenMiddlewere, contractAuthentication, get_Contract(prisma, Query_Type))

module.exports = {Contract}