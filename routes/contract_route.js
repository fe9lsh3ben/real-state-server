const { express } = require('../libraries/utilities');
const { prisma} = require('../libraries/prisma_utilities');
const {generateContractFunction} = require('../libraries/functions&middlewares_lib');


const contract = express.Router();


contract.route('/')
    //Request's body example: 

    .post(generateContractFunction(prisma))
    .put()
    .get()
    .delete();




module.exports = {contract}