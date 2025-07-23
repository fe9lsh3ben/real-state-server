const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const { 
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
    tokenMiddlewere, updatePolygon } = require('../libraries/functions&middlewares_lib')
const REU = express.Router();


REU.route('/REU')

    /**Request's body example: {
    "UnitType":"LAND","DeedNumber": "43-42308432","DeedDate": 1990/12/12,
    "DeedOwners":[{"Owner number":"0546737456", "Gov_ID":"1089089089", "Owner name":"Sultan shabin"}],
    "AffiliatedOffice": 12, "Initiator":" Rabigh Office",
    "Polygon": [[32.323,34.2322],[32.445,32.545],[32.897,32.123],[32.323,34.2322]],"Specifications":[{"area":"300 m","ready":"yes"}],
    "Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude", "altitude":"1.2524", "Longtude":"2.5652"}},
    "Office_ID":"234"
    }
    **/
   
   
    .post(tokenMiddlewere, generate_REU(prisma))
    .get(tokenMiddlewere, get_REU(prisma))
    .put(tokenMiddlewere, update_REU(prisma))
    .delete(tokenMiddlewere, delete_REU(prisma));

    /**Request's body example: {
     "REU_ID" : 234
     "Polygon": [[32.323,34.2322],[32.445,32.545],[32.897,32.123],[32.323,34.2322]],"Specifications":[{"area":"300 m","ready":"yes"}],
    }
     */
 

module.exports = { REU }