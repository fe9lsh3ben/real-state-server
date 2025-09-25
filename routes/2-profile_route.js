const { express } = require('../libraries/utilities');
const { prisma, User_Type } = require('../libraries/prisma_utilities');

const {
    signupValidator, signupVerifier, signup,
    login,
    get_Profile,
    edit_Profile,
    becomeOfficeStaff,
    logout,
    checkToken,
    tokenMiddlewere, generateTokenByRefreshToken
} = require('../libraries/functions&middlewares_lib');



const profile = express.Router();


profile.route('/signup')
/*Request's body example: {
  "Username": "fe9lsh3ben",
  "Password": "10890Fsh",
  "Email": "fe9olsh3ben@gmail.com",
  "Gov_ID": "1089036089",
  "Address": {
    "Region": "Makkah",
    "City": "Makkah"
  },
  "Full_Name": ["Faisal", "Mohammed"],
  "User_Phone": "0546737456",
  "TC_ID": "B_000001"
}
*/
.post(signupVerifier, signupValidator(prisma), signup(prisma))



profile.route('/login')
//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh"} 
.put(login(prisma));



// profile.route('/become_office_staff')
// //Request's body example: {"ChangeToRole": "REAL_ESTATE_OFFICE_OWNER"}
// .put(tokenMiddlewere,becomeOfficeStaff(prisma, User_Type))



profile.route('/get_profile')
.get(tokenMiddlewere,get_Profile(prisma));



profile.route('/edit_profile')
//Request's body example: {"Email":"fe9olsh3ben@gmail.com","Address":{"Region":"Mekkah", "City":"Rabigh"},"Other1":[{"":""}]}
.put(tokenMiddlewere,edit_Profile(prisma));



profile.route('/renew_token')
//**if return value is jwt expired take an action.
.put(generateTokenByRefreshToken(prisma));



profile.route('/check_token')
.put(checkToken());



profile.route('/logout')
.put(tokenMiddlewere, logout(prisma));


module.exports = {profile};