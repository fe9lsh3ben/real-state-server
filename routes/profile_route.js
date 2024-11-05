const { express } = require('../libraries/utilities');
const { prisma, User_Type } = require('../libraries/prisma_utilities');

const { signupFunction, signupValidator, signupVerifier,
    loginFunction, changeUserTypeFunction,getProfile,getProfiles,
    editProfile,

    tokenVerifier, generatTokenByRefreshToken
} = require('../libraries/functions&middlewares_lib');



const profile = express.Router();


profile.route('/signup')

//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "GovID":"1089036089", "Address":"Makkah-Makkah-Shuqeyah", "FullName":["Faisal", "Mohammed"], "UserPhone": "0546737456","TermsCondetion":"B_000001"}
.post(signupVerifier, signupValidator(prisma), signupFunction(prisma))



profile.route('/login')
//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh"} 
.post(loginFunction(prisma))




profile.route('/change_user_type')
//Request's body example: {"ChangeToRole": "REAL_ESTATE_OFFICE_OWNER","FalLicense":"5311864512"}
.put(tokenVerifier,changeUserTypeFunction(prisma, User_Type))

    


profile.route('/get_profile')
.get(tokenVerifier,getProfile(prisma));



profile.route('/get_profiles')
.get(tokenVerifier,getProfiles(prisma));


profile.route('/edit_profile')
//Request's body example: {"Email":"fe9olsh3ben@gmail.com","Address":"Makkah-Makkah-Shuqeyah","FalLicense":"53135223","Other1":[{"":""}]}
.put(tokenVerifier,editProfile(prisma));


profile.route('/renewToken')
//{"Authorization": bearer jg095ujgriojg54-50=32it0-5i9tfgkor=4-0=[fepdkcxlmc9t3-0]}  
//**if return value is jwt expired take an action.
.put(generatTokenByRefreshToken(prisma));



module.exports = {profile};