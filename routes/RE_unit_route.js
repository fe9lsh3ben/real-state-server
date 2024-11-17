const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const { build_up_REU_Function, tokenMiddlewere, updatePolygon } = require('../libraries/functions&middlewares_lib')
const REU = express.Router();


REU.route('/create_REU')

    /**Request's body example: {
    "UnitType":"LAND","DeedNumber": "43-42308432","DeedDate": 1990/12/12,
    "DeedOwners":[{"Owner number":"0546737456", "Owner Identity Number":"1089089089", "Owner name":"Sultan shabin"}],
    "AffiliatedOffice": 12, "Initiator":" Rabigh Office",
    "Polygon": [[32.323,34.2322],[32.445,32.545],[32.897,32.123],[32.323,34.2322]],"Specifications":[{"area":"300 m","ready":"yes"}],
    "Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude", "altitude":"1.2524", "Longtude":"2.5652"}},
    "OfficeID":"234"
    }
    **/
    .post(tokenMiddlewere, build_up_REU_Function(prisma));


    /**Request's body example: {
     "UnitID" : 234
     "Polygon": [[32.323,34.2322],[32.445,32.545],[32.897,32.123],[32.323,34.2322]],"Specifications":[{"area":"300 m","ready":"yes"}],
    }
     */
REU.route('/update_Land_polygon')
    .put(tokenMiddlewere, updatePolygon(prisma));


module.exports = { REU }