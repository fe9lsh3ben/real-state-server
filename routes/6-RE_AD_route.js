const { express } = require('../libraries/utilities');
const { prisma, AD_Type } = require('../libraries/prisma_utilities');
const { officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication
} = require('../middlewares/authentications');

const {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
    tokenMiddlewere } = require('../libraries/functions&middlewares_lib');


const RE_AD = express.Router();


RE_AD.route('/')

    /**Request's body example:{
    "RealEstate" :"3" ,"AD_Type" : "RENT" ,
    "AD_Unit_Type": "APARTMENT" ,
    "AD_Content":{
    "Area" : "300 m" , "Ready" : "yes"},
    "AdStartedAt": "2025-01-12"  ,"AdExpiry":  "2026-12-31",
    "Unit_ID": "6",
    "Office_ID": "46"
    }*/
.post(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, generate_READ(prisma))


// query parameters : 'http://127.0.0.1:3050/RE_AD?Unit_ID=1&Search_Type=search_one'

// query parameters : 'http://127.0.0.1:3050/RE_AD?Geo_level=Region&Geo_value=Mekkah&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Geo_level=City&Geo_value=Rabigh&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Geo_level=District&Geo_value=Al-Jude&Search_Type=search_many'


// query parameters : 'http://127.0.0.1:3050/RE_AD?minLatitude=1.0000&maxLatitude=2.0000&minLongitude=2.0000&maxLongitude=3.0000&Search_Type=search_on_screen'
// query parameters : 'http://127.0.0.1:3050/RE_AD?City=Rabigh&Direction=NORTH&Search_Type=search_direction'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=custom_search&City=Rabigh&Unit_Type=LAND&Specifications=%7B%22Area%22%3A%22300%22%2C%22Ready%22%3A%22yes%22%7D'
 
    
.get(tokenMiddlewere, get_READ(prisma, AD_Type))
    
    
.put(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, edit_READ(prisma))
    
    
.delete(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, delete_READ(prisma));


module.exports = { RE_AD }