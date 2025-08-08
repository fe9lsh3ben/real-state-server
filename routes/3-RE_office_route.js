const { express } = require('../libraries/utilities');
const { prisma, Office_Or_User_Status, User_Type} = require('../libraries/prisma_utilities');
const {
    generate_REO,
    get_REO,
    update_REO,
    tokenMiddlewere,
 
} = require('../libraries/functions&middlewares_lib');
const { officeAuthentication } = require('../middlewares/authentications');
const REO = express.Router();


REO.route('/')

//Request's body example: {"Commercial_Register": "543020154","Office_Phone":"012343","Office_Name":"West RE Office","Address":{"Region":"Mekkah", "City":"Rabigh", "District":"Al-Jude","Direction": "NORTH", "Latitude":"1.2524", "Longitude":"2.5652"}}
.post(tokenMiddlewere, generate_REO(prisma, Office_Or_User_Status, User_Type))

// query parameters : 'http://127.0.0.1:3050/REO?Office_ID=41&Search_Type=search_one'

// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=Region&Geo_value=Mekkah&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=City&Geo_value=Rabigh&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=District&Geo_value=Al-Jude&Search_Type=search_many'

// query parameters : 'http://127.0.0.1:3050/REO?minLatitude=1.0000&maxLatitude=2.0000&minLongitude=2.0000&maxLongitude=3.0000&Search_Type=search_on_screen'
// query parameters : 'http://127.0.0.1:3050/REO?City=Rabigh&Direction=NORTH&Search_Type=search_direction'

 
.get(tokenMiddlewere, get_REO(prisma))

//Request's body example: {"Office_ID": 44,"Office_Phone":"0126784123"}
.put(tokenMiddlewere, officeAuthentication, update_REO(prisma));



 
                                
                                
                                

 



module.exports = {REO}