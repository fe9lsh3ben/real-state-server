const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {
    tokenMiddlewere,

    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
} = require('../libraries/functions&middlewares_lib')
const FalLicense = express.Router();


 
FalLicense.route('/')
.post(tokenMiddlewere,officeAuthentication, generate_FalLicense(prisma))
.get(tokenMiddlewere,officeAuthentication, get_FalLicense(prisma))
.delete(tokenMiddlewere,officeAuthentication, delete_FalLicense(prisma));



module.exports = {FalLicense}