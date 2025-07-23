const { express } = require('../libraries/utilities');
const { prisma, Office_Or_User_Status} = require('../libraries/prisma_utilities');
const {
    generate_REO,
    get_REO,
    update_REO,
    tokenMiddlewere,
 
} = require('../libraries/functions&middlewares_lib')
const REO = express.Router();


REO.route('/')
//Request's body example: {"Commercial_Register": "543020154","Office_Phone":"012343","Office_Name":"West RE Office","Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude", "altitude":"1.2524", "Longtude":"2.5652"}}

.post(tokenMiddlewere, generate_REO(prisma, Office_Or_User_Status))
.get(tokenMiddlewere, get_REO(prisma))
.put(tokenMiddlewere, update_REO(prisma));

 



module.exports = {REO}