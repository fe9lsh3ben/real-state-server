
//________________Funtions___________________


//utilities 
const { bodyCleaner } = require('../middlewares/miscellaneous');

//token functions
const { tokenMiddlewere, generateTokenByRefreshToken } = require('../functions/token_functions');

//Ts&Cs functions
const { createNewTandC, getLastTerms } = require('../functions/1-Ts&Cs_functions');

//profile functions
const { signup, login, becomeOfficeStaff,
    get_Profile, edit_Profile
} = require('../functions/2-Profile_functions');

//Real Estate office functions
const { generate_REO, get_REO, update_REO, } = require('../functions/3-REO_functions');

//Fall License functions
const {
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense, } = require('../functions/4-FalLicense_function');

//Real Estate functions
const {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU, } = require('../functions/5-REU_functions');

//Real Estate Ad functions
const {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
} = require('../functions/6-RE_AD_functions');

//Conract functions
const {
    generate_Contract,
    get_Contract,
    update_Contract,
    delete_Contract,
} = require('../functions/7-contract_functions')


//________________Middlewares___________________
const { signupValidator, signupVerifier } = require('../middlewares/validators');


module.exports = {

    //Ts&Cs functions
    createNewTandC,
    getLastTerms,


    //profile functions
    signup,
    login,
    get_Profile,
    edit_Profile,
    becomeOfficeStaff,

    //Real Estate office functions
    generate_REO,
    get_REO,
    update_REO,

    // Fall License functions
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense,

    //Real Estate unit functions
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,


    //Real Estate Ad functions
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,

    //Contract functions
    generate_Contract,
    get_Contract,
    update_Contract,
    delete_Contract,


    //middlewares
    signupVerifier,
    signupValidator,
    tokenMiddlewere, generateTokenByRefreshToken,
    bodyCleaner
}