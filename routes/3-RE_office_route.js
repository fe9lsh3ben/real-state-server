const { express } = require('../libraries/utilities');
const { prisma, Office_Or_User_Status, User_Type} = require('../libraries/prisma_utilities');
const {
    generate_REO,
    get_REO,
    update_REO,
    tokenMiddlewere,
 
} = require('../libraries/functions&middlewares_lib')
const REO = express.Router();


REO.route('/')

//Request's body example: {"Commercial_Register": "543020154","Office_Phone":"012343","Office_Name":"West RE Office","Address":{"Region":"Mekkah", "City":"Rabigh", "Destrect":"Al-Jude","Direction": "North", "Altitude":"1.2524", "Longitude":"2.5652"}}
.post(tokenMiddlewere, generate_REO(prisma, Office_Or_User_Status, User_Type))

// query parameters : 'http://127.0.0.1:3050/REO?Office_ID=1&Search_Type=search_one'

// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=Region&City=Rabigh&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=City&City=Rabigh&Search_Type=search_many'
// query parameters : 'http://127.0.0.1:3050/REO?Geo_level=Destrect&City=Rabigh&Search_Type=search_many'

// query parameters : 'http://127.0.0.1:3050/REO?coordinates[minAltitude]=1.0000&coordinates[maxAltitude]=2.0000&coordinates[minLongitude]=2.0000&coordinates[maxLongitude]=3.0000&Search_Type=search_on_screen'
// query parameters : 'http://127.0.0.1:3050/REO?Direction=North&Search_Type=search_direction'

 
.get(tokenMiddlewere, get_REO(prisma))

//Request's body example: {"Office_ID": 5,"Office_Phone":"0126784123"}
.put(tokenMiddlewere, update_REO(prisma));
 
                                
                                
                                

 



module.exports = {REO}