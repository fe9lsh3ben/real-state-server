const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {build_up_REO_Function} = require('../libraries/functions_lib')
const REO = express.Router();


REO.route('/')
    //Request's body example: 

    .post(build_up_REO_Function(prisma))
    .put()
    .get()
    .delete();




module.exports = {REO}