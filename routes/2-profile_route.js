const { express } = require('../libraries/utilities');
const { prisma, User_Type } = require('../libraries/prisma_utilities');

const {
    signupValidator, signupVerifier, signup,
    login,
    get_Profile,
    edit_Profile,
    becomeOfficeStaff,

    tokenMiddlewere, generatTokenByRefreshToken
} = require('../libraries/functions&middlewares_lib');



const profile = express.Router();


profile.route('/signup')

//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "Gov_ID":"1089036089","Address":{"Region":"Mekkah", "City":"Makkah", "Destrect":"Al-shouqeyah","Direction": "North", "Altitude":"1.2524", "Longitude":"2.5652"}, "Full_Name":["Faisal", "Mohammed"], "User_Phone": "0546737456","TC_ID":"B_000001"}
.post(signupVerifier, signupValidator(prisma), signup(prisma))



profile.route('/login')
//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh"} 
.put(login(prisma))




profile.route('/become_office_staff')
//Request's body example: {"ChangeToRole": "REAL_ESTATE_OFFICE_OWNER","FalLicense":"5311864512"}
.put(tokenMiddlewere,becomeOfficeStaff(prisma, User_Type))

    


profile.route('/get_profile')
.get(tokenMiddlewere,get_Profile(prisma));



 
profile.route('/edit_profile')
//Request's body example: {"Email":"fe9olsh3ben@gmail.com","Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude","Direction": "North", "Altitude":"1.2524", "Longitude":"2.5652"},"Other1":[{"":""}]}
.put(tokenMiddlewere,edit_Profile(prisma));


profile.route('/renew_token')
//{"Authorization": bearer jg095ujgriojg54-50=32it0-5i9tfgkor=4-0=[fepdkcxlmc9t3-0]}  
//**if return value is jwt expired take an action.
.put(generatTokenByRefreshToken(prisma));



module.exports = {profile};