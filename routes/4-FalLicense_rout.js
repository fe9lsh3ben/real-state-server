const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {
    tokenMiddlewere,

    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
} = require('../libraries/functions&middlewares_lib')
const FalLice = express.Router();


 
FalLice.route('/Fal_License')
.post(tokenMiddlewere, generate_FalLicense(prisma))
.get(tokenMiddlewere, get_FalLicense(prisma))
.delete(tokenMiddlewere, delete_FalLicense(prisma));



module.exports = {FalLice}