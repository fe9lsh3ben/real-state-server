const { express } = require('../libraries/utilities');
const { prisma, User_Type } = require('../libraries/prisma_utilities');

const { signupFunction, signupValidator, signupVerifier,
    loginFunction, changeUserTypeFunction
} = require('../libraries/functions&middlewares_lib');



const signup = express.Router();
const login = express.Router();
const changeUserType = express.Router();
const getProfile = express.Router();
const editProfile = express.Router();


signup.route('/signup')
    //Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "GovID":"1089036089", "Address":"Makkah-Makkah-Shuqeyah", "FullName":["Faisal", "Mohammed"], "UserPhone": "0546737456","TermsCondetion":"B_000001"}

    .post(signupVerifier, signupValidator(prisma), signupFunction(prisma))
    .put()
    .get()
    .delete();


login.route('/login')
    //Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh"}

    .post(loginFunction(prisma))
    .put()
    .get()
    .delete();



changeUserType.route('/change_user_type')
    //Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "GovID":"1089036089", "Address":"Makkah-Makkah-Shuqeyah", "FullName":["Faisal", "Mohammed"], "UserPhone": "0546737456","TermsCondetion":"B_000001"}

    .post(changeUserTypeFunction(prisma, User_Type))
    .put()
    .get()
    .delete();



getProfile.route('/get_profile')

    .get();



editProfile.route('/edit_profile')

    .put();


module.exports = { signup, login, changeUserType, getProfile, editProfile};