const {express} = require('../libraries/utilities');
const {prisma, Committed_By} = require('../libraries/prisma_utilities');
const {findLast_TC_orCreateFunction} = require('../libraries/functions&middlewares_lib');


const T_AND_C = express.Router();


T_AND_C.route('/')
    //Request's body example: {"CommittedBy":"BENEFICIARY","Content":"T&Cs content","MadeBy":"Admin"}
    .post(findLast_TC_orCreateFunction(prisma, Committed_By))
    .put()
    .get()
    .delete();

module.exports = {T_AND_C};