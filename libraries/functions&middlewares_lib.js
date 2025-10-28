
//________________Funtions___________________


//utilities 
const { bodyCleaner } = require('../middlewares/miscellaneous');

//token functions
const { tokenMiddlewere, generateTokenByRefreshToken, checkToken } = require('../functions/token_functions');

//Ts&Cs functions
const { createNewTandC, getLastTerms } = require('../functions/1-Ts&Cs_functions');

//profile functions
const { signup, login, becomeOfficeStaff,
    get_Profile, get_Custom_Profile, edit_Profile, logout
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
    get_Contract_Unregistered,
} = require('../functions/7-contract_functions')

const {
    createNotification,
    getNotifications,
    markNotificationRead,
    countUnread,
} = require('../functions/8-notification_function');
//________________Middlewares___________________
const { signupValidator, signupVerifier } = require('../middlewares/validators');

const { 
    officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication,
    READAuthentication
} = require('../middlewares/authentications');
module.exports = {

    //Ts&Cs functions
    createNewTandC,
    getLastTerms,


    //profile functions
    signup,
    login,
    get_Profile,
    edit_Profile,
    get_Custom_Profile,
    becomeOfficeStaff,
    logout,

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
    get_Contract_Unregistered,

    //Notifications functions
    createNotification,
    getNotifications,
    markNotificationRead,
    countUnread,


    //middlewares
    signupVerifier,
    signupValidator,
    tokenMiddlewere, generateTokenByRefreshToken, checkToken,
    bodyCleaner,

    officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication,
    READAuthentication
}