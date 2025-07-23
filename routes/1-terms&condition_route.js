const {express} = require('../libraries/utilities');
const {prisma, Committed_By} = require('../libraries/prisma_utilities');
const {
    createNewTandC,
    getLastTerms,
} = require('../libraries/functions&middlewares_lib');


const T_AND_C = express.Router();


T_AND_C.route('/')
    //Request's body example: {"Committed_By":"BENEFICIARY","Content":"T&Cs content","Made_By":"Admin"}
    .post(createNewTandC(prisma, Committed_By))
    //Request's body example: {"Committed_By":"BENEFICIARY"}
    .get(getLastTerms(prisma));



module.exports = {T_AND_C};