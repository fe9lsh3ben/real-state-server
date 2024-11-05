//___________Utilities______________
const  {express, bcrypt, https, http, cors, fs} = require('./libraries/utilities')


//___________Functions______________






const {
    PrismaClient,
    Prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By } = require('@prisma/client');




const prisma = new PrismaClient();






//___________SERVER SETTINGS______________

var app = express()

app.use(express.json(), cors({
    origin: "*",
    credentials: true,
    allowedHeaders: "Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,locale"
}));


//___________TLS CRADENTIALS______________

var options = {
    /** Work */ key: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2-key.pem'),
    /** Work */ cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2.pem'),
    /** Home */ //key: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2-key.pem'),
    /** Home *///cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2.pem')
};







//                                  ___________App______________



//___________Modules______________



const {
    T_AND_C,
    profile,
    REO,
    REU,
    Contract,
    RE_AD

} = require('./libraries/routes_lib');
 

app.use('/T&C', T_AND_C);


app.use('/profile', profile);


app.use('/REO', REO);


app.use('/REU', REU);


app.use('/contract', Contract);


app.use('/generate_RE_AD', RE_AD)












//___________SERVER______________


const port = 3050;
const host = '127.0.0.1'
var server = http.createServer(options, app);

server.listen(port, host, () => {

    console.log(`server listining at ${host}:${port}`)
});