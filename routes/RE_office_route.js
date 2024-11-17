const { express } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');
const {build_up_REO_Function,update_REO, tokenMiddlewere} = require('../libraries/functions&middlewares_lib')
const REO = express.Router();


REO.route('/build_REO')
//Request's body example: {"CommercialRegister": "543020154","OfficeName":"West RE Office","Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude", "altitude":"1.2524", "Longtude":"2.5652"}}
.post(tokenMiddlewere, build_up_REO_Function(prisma));

REO.route('/edit_REO')
.put(tokenMiddlewere, update_REO(prisma))





module.exports = {REO}