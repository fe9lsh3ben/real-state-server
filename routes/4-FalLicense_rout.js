const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {officeAuthentication} = require('../middlewares/authentications');
const {
    tokenMiddlewere,

    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
} = require('../libraries/functions&middlewares_lib')

const FalLicense = express.Router();



FalLicense.route('/')
 
/*example: { 
"Office_ID": "44",
"Fal_License_Number": "12345", 
"License_Type": "MARKETING", 
"Issue_Date": "2020-01-01", 
"Expiry_Date": "2029-01-01"
 }
*/
.post(tokenMiddlewere,officeAuthentication, generate_FalLicense(prisma))

//example: http://127.0.0.1:3050/FalLicense?Fal_License_Number=12345 || Office_ID=3
.get(tokenMiddlewere, get_FalLicense(prisma))

//example: { "Fal_License_Number": "12345" }
.delete(tokenMiddlewere, delete_FalLicense(prisma));



module.exports = {FalLicense}