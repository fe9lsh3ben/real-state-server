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
    "AD_Specifications":{
    "Area" : "300 m" , "Ready" : "yes"},
    "AdStartedAt": "2025-01-12"  ,"AdExpiry":  "2026-12-31",
    "Unit_ID": "6",
    "Office_ID": "46"
    }*/
.post(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, generate_READ(prisma))


// query parameters : 'http://127.0.0.1:3050/RE_AD?AD_ID=1&Search_Type=search_one'

// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=search_many&AD_Type=RENT&AD_Unit_Type=APARTMENT&Geo_level=Region&Geo_value=Mekkah'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=search_many&AD_Type=RENT&AD_Unit_Type=APARTMENT&Geo_level=City&Geo_value=Rabigh'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=search_many&AD_Type=RENT&AD_Unit_Type=APARTMENT&Geo_level=District&Geo_value=Al-Jude'


// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=search_on_map&AD_Type=RENT&AD_Unit_Type=APARTMENT&minLatitude=1.0000&maxLatitude=2.0000&minLongitude=2.0000&maxLongitude=3.0000'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=search_direction&AD_Type=RENT&AD_Unit_Type=APARTMENT&City=Rabigh&Direction=NORTH'
// query parameters : 'http://127.0.0.1:3050/RE_AD?Search_Type=custom_search&AD_Type=RENT&AD_Unit_Type=APARTMENT&City=Rabigh&Unit_Type=LAND&Lower_Price=1&Upper_Price=10000&Specifications=%7B%22Area%22%3A%22300%22%2C%22Ready%22%3A%22yes%22%7D'
 
    
.get(tokenMiddlewere, get_READ(prisma, AD_Type))
    
    
.put(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, edit_READ(prisma))
    
    
.delete(tokenMiddlewere, officeAuthentication, markitingFalLicenseAuthentication, REUAuthentication, delete_READ(prisma));


module.exports = { RE_AD }