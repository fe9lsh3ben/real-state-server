const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {generateRE_ADFunction} = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/generate_READ')
    //Request's body example: 

    .post(generateRE_ADFunction(prisma))
    .put()
    .get()
    .delete();




module.exports = {RE_AD}