const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {
    generate_Contract,
    get_Contract,
    get_Contract_Unregistered,
    tokenMiddlewere} = require('../libraries/functions&middlewares_lib');

const { officeAuthentication, contractAuthentication } = require('../middlewares/authentications');



const Contract = express.Router();


Contract.route('/')
    /** Request's body example: {"Office_ID":234 ,"PartiesConsent"://{GOV ID,Name, SignatureOTP, Phone Number},
    "Contant":{content, contract terms} }
    **/
    .post(tokenMiddlewere, officeAuthentication, generate_Contract(prisma))
    .get(tokenMiddlewere, contractAuthentication, get_Contract(prisma))


Contract.route('/get-contract-unregitered')

    .get(get_Contract_Unregistered(prisma));


    
module.exports = {Contract}