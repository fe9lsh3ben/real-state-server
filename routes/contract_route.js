const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {generateContractFunction} = require('../libraries/functions&middlewares_lib');


const Contract = express.Router();


Contract.route('/')
    //Request's body example: 

    .post(generateContractFunction(prisma))
    .put()
    .get()
    .delete();




module.exports = {Contract}