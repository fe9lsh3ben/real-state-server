
const {signupFunction} = require('../functions/signup_function');
const {loginFunction} = require('../functions/login_function');
const {build_up_REO_Function} = require('../functions/build_up_REO');
const {findLast_TC_orCreateFunction} = require('../functions/Ts&Cs_function');
const {changeUserTypeFunction} = require('../functions/userType_function');
const {generateContractFunction} = require('../functions/contract_function');
const {generate_RE_AD} = require('../functions/RE_AD_function')

const {signupValidator, signupVerifier } = require('../middlewares/validators')


module.exports = {signupFunction, signupValidator, signupVerifier,
    loginFunction, build_up_REO_Function, findLast_TC_orCreateFunction,
    changeUserTypeFunction, generateContractFunction, generate_RE_AD}