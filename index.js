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
const {signupFunction} = require('./functions/signup_function')
const { signupValidator, signupVerifier } = require('./middlewares/validators')

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


require('dotenv').config();
app.get('/', (req, res) => {

    console.log(process.env.JWT_SECRET)
    //res.send("assssssk for get");

})


//Request's body example: {"CommittedBy":"BENEFICIARY","Content":"T&Cs content","MadeBy":"Admin"}
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


//Request's body example: {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "GovID":"1089036089", "Address":"Makkah-Makkah-Shuqeyah", "FullName":"Faisal Mohammed", "UserPhone": "0546737456"}
app.post('/signup',
    signupVerifier,
    signupValidator(prisma),
    signupFunction(prisma));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await prisma.user.findUnique({
        where: { username: username },
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Validate the password
    try {
        const validPassword = await argon2.verify(hashedPassword, password);
        console.log(validPassword)
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid password' });
        }
    } catch (err) {
        throw new Error('Password verification failed');
    }


    // Generate JWT using RS256
    // const accessToken = generateAccessToken(user);

    // res.json({
    //     accessToken,
    //     message: 'Login successful',
    // });
});


app.use('/auth&auth', auth);





//___________SERVER______________


const port = 3050;
const host = '127.0.0.1'
var server = http.createServer(options, app);

server.listen(port, host, () => {

    console.log(`server listining at ${host}:${port}`)
});