const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const { officeAuthentication, falLicenseAuthentication } = require('../middlewares/authentications');
const {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
    tokenMiddlewere } = require('../libraries/functions&middlewares_lib');
const { FalLicense } = require('./4-FalLicense_rout');
const REU = express.Router();


REU.route('/')

/**Request's body example: {"Unit_Type":"LAND", "RE_Name": "Al-asiri", "Deed_Number": "4342308432", "Deed_Date": "1990/12/12",
    "Deed_Owners":[{"Owner_Phone_Number": "0546737456", "Owner_GovID":"1089089089", "Owner_Name":"Sultan shabin"}],
    "Affiliated_Office": "3",
    "Initiator":{"Created_By":{"User_ID":"3", "Full_Name": ["sultan", "shabin"]}, "Edited_By":[]},
    "Address":{"Region":"Mekkah", "City":"Rabigh", "Direction": "North", "Destrect":"Al-Jude", "Altitude":"1.2524", "Longitude":"2.5652"},
    "Specifications":[{"Area":"300 m","Ready":"yes"}],
    "Outdoor_Unit_Images": "5",
	"Office_ID":"3"
    }
**/

.post(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, generate_REU(prisma))

// query parameters : 'http://127.0.0.1:3050/REU?Unit_ID=1&Search_Type=search_one'

// query parameters : 'http://127.0.0.1:3050/REU?Geo_level=Region&Geo_value=Mekkah&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REU?Geo_level=City&Geo_value=Rabigh&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REU?Geo_level=Destrect&Geo_value=Al-Jude&Search_Type=search_many'


// query parameters : 'http://127.0.0.1:3050/REU?coordinates[minAltitude]=1.0000&coordinates[maxAltitude]=3.0000&coordinates[minLongitude]=1.0000&coordinates[maxLongitude]=3.0000&Search_Type=search_on_screen'
// query parameters : 'http://127.0.0.1:3050/REU?Direction=North&Search_Type=search_direction'

 
.get(tokenMiddlewere, get_REU(prisma))

/*{"Unit_Type":"LAND", "RE_Name": "Al-asiri",
    "Deed_Owners":[{"Owner_Phone_Number": "0546737456", "Owner_GovID":"1089089089", "Owner_Name":"Sultan shabin"}],
    "Affiliated_Office": "3",
    "Edited_By": {"User_ID":"6", "Full_Name": ["fff", "shabin"], "Date":"2022/12/12"},
    "Address":{"Region":"Mekkah", "City":"Rabigh", "Direction": "North", "Destrect":"Al-Jude", "Altitude":"1.2524", "Longitude":"2.5652"},
    "Specifications":[{"Area":"300 m","Ready":"yes"}],
    "Unit_ID":"4",
	"Office_ID":"3"
    }
*/
.put(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, update_REU(prisma))


.delete(tokenMiddlewere, officeAuthentication, falLicenseAuthentication, delete_REU(prisma));

/**Request's body example: {
 "REU_ID" : 234
 "Polygon": [[32.323,34.2322],[32.445,32.545],[32.897,32.123],[32.323,34.2322]],"Specifications":[{"area":"300 m","ready":"yes"}],
}
 */


module.exports = { REU }