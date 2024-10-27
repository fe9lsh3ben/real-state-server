
//________________Funtions___________________
const {findLast_TC_orCreateFunction} = require('../functions/Ts&Cs_function');

const {signupFunction} = require('../functions/signup_function');
const {loginFunction} = require('../functions/login_function');
const {changeUserTypeFunction} = require('../functions/userType_function');

const {build_up_REO_Function} = require('../functions/build_up_REO');
const {build_up_REU_Function} = require('../functions/build_up_REU');
const {generateContractFunction} = require('../functions/contract_function');
const {generate_RE_AD} = require('../functions/RE_AD_function')


//________________Middlewares___________________
const {signupValidator, signupVerifier } = require('../middlewares/validators');


module.exports = { 
    findLast_TC_orCreateFunction,

    signupFunction,
    loginFunction,
    changeUserTypeFunction, 

    build_up_REO_Function, 
    build_up_REU_Function, 
    generateContractFunction,
    generate_RE_AD,

    signupVerifier,
    signupValidator,
}