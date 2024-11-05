const {express} = require('../libraries/utilities');
const {prisma, Committed_By} = require('../libraries/prisma_utilities');
const {createNewTandC, getLastTerms} = require('../libraries/functions&middlewares_lib');


const T_AND_C = express.Router();


T_AND_C.route('/')
    //Request's body example: {"CommittedBy":"BENEFICIARY","Content":"T&Cs content","MadeBy":"Admin"}
    .post(createNewTandC(prisma, Committed_By))
    .put()
    //Request's body example: {"CommittedBy":"BENEFICIARY"}
    .get(getLastTerms(prisma))
    .delete();



module.exports = {T_AND_C};