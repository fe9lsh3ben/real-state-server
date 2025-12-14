const { express } = require('../libraries/utilities');
const { prisma, AD_Type } = require('../libraries/prisma_utilities');


const {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
    tokenMiddlewere,
    bodyCleaner,

    officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication,
    READAuthentication} = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/')

    /**Request's body example:{
      "Unit_ID": "6",
    "Office_ID": "46",
    "RealEstate" :"3" ,"AD_Type" : "RENT" ,
    "AD_Unit_Type": "APARTMENT" ,
    "Price": "1000" ,
    "AD_Specifications":{
    "Area" : "300" , "Ready" : "yes"}
    }*/

    .post(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, generate_READ(prisma))


    // query parameters : 'http://127.0.0.1:3050/RE_AD?AD_ID=1&Search_Type=complete'

    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&Region=Mekkah'
    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&City=Rabigh'
    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&District=Al-Jude'


    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&minLatitude=1.0000&maxLatitude=2.0000&minLongitude=2.0000&maxLongitude=3.0000'
    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&City=Rabigh&Direction=NORTH'
    // query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=for_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&City=Rabigh&Unit_Type=LAND&Lower_Price=0&Upper_Price=10000&AD_Specifications=%7B%22Area%22%3A%22300%22%2C%22Ready%22%3A%22yes%22%7D'


    .get(bodyCleaner, tokenMiddlewere, get_READ(prisma))


    .put(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, READAuthentication, edit_READ(prisma))


    .delete(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, READAuthentication, delete_READ(prisma));


module.exports = { RE_AD }