const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {generate_RE_AD} = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/')
    //Request's body example: 

    .post(generate_RE_AD(prisma))
    .put()
    .get()
    .delete();




module.exports = {RE_AD}