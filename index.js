//___________Library______________
var express = require('express');
const bcrypt = require('bcrypt');
var https = require('https');
var http = require('http');
var cors = require('cors');
var fs = require('fs');

var { find_last_termsANDconditions, createtermsANDcondition } = require('./prismaDB_utilities/Ts&Cs_utilities')

const {
    PrismaClient,
    Prisma,
    User_Type,
    Office_Or_User_Status,
    Real_Estate_Unit_Type,
    Committed_By } = require('@prisma/client');


const prisma = new PrismaClient();
// const advancedPrisma = prisma.$extends({
//     model: {
//         $allModels: {
//             async uniqueExists(where) {
//                 // Get the current model at runtime
//                 const context = Prisma.getExtensionContext(this);

//                 const result = await context.findUnique({ where });
//                 return result !== null;
//             }
//         },
//     },
// });


// var a = options.a !== undefined ? options.a : "nothing";

//___________Modules______________


const auth = require('./auth')

const { signUpValidator, requestVerifier } = require('./middlewares/validators')

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


app.get('/', (req, res) => {
    res.send("assssssk for get");

})

app.post('/regT&C', async (req, res) => {


    var result;
    try {

        result = await find_last_termsANDconditions(prisma, Committed_By, req)

    } catch (err) {
        result = err;
        console.log(err, ' from OFFICE_OWNER')
    }

    res.send(result);

})

app.post('/signUp',
    signUpValidator,
    requestVerifier(prisma),
    async (req, res) => {
        
        await prisma.user.create({
            data: {
                Username: Username,
                Email: Email,
                GovID: GovID,
                Address: Address,
                FullName: FullName,
                UserPhone: UserPhone
            }
        }).then((v)=> console.log(v))
    });


app.use('/auth&auth', auth);





//___________SERVER______________


const port = 3050;
const host = '127.0.0.1'
var server = http.createServer(options, app);

server.listen(port, host, () => {

    console.log(`server listining at ${host}:${port}`)
});