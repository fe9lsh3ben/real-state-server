
//________________Funtions___________________
const {createNewTandC, getLastTerms} = require('../functions/Ts&Cs_functions');

const {generateTokenByPrivate_key, tokenVerifier, tokenMiddlewere, generatTokenByRefreshToken} = require('../functions/token_functions');

const {signupFunction, loginFunction, changeUserTypeFunction,
    getProfile, getProfiles, editProfile
} = require('../functions/Profile_functions');

const {build_up_REO_Function, update_REO} = require('../functions/REO_functions');
const {build_up_REU_Function} = require('../functions/REU_functions');
const {generateContractFunction} = require('../functions/contract_functions');
const {generateRE_ADFunction} = require('../functions/RE_AD_functions')


//________________Middlewares___________________
const {signupValidator, signupVerifier } = require('../middlewares/validators');


module.exports = { 
    createNewTandC,
    getLastTerms,

    tokenVerifier, tokenMiddlewere, generatTokenByRefreshToken,
    
    signupFunction,
    loginFunction,
    changeUserTypeFunction,
    getProfile,
    getProfiles,
    editProfile,

    build_up_REO_Function,
    update_REO,
    build_up_REU_Function, 
    generateContractFunction,
    generateRE_ADFunction,

    signupVerifier,
    signupValidator,
}