const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {build_up_REU_Function} = require('../libraries/functions&middlewares_lib')
const REU = express.Router();


REU.route('/')
    //Request's body example: 

    .post(build_up_REU_Function(prisma))
    .put()
    .get()
    .delete();




module.exports = {REU}