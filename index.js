//___________Library______________
var express = require('express');
const bcrypt = require('bcrypt');
var https = require('https');
var http = require('http');
var cors = require('cors');
var fs = require('fs');

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


// var a = options.a !== undefined ? options.a : "nothing";

//___________Modules______________
const auth = require('./auth')


//___________SERVER SETTINGS______________

var app = express()

app.use(express.json(),cors({
    origin:"*",
    credentials: true,
    allowedHeaders: "Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,locale"}));


//___________TLS CRADENTIALS______________

var options = {
    /** Work */ key: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2-key.pem'),
    /** Work */ cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2.pem'),
    /** Home */ //key: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2-key.pem'),
    /** Home *///cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2.pem')
};


//___________App______________


app.get('/', (req,res)=>{
    res.send("ask for get");
})
app.post('/', (req,res)=>{

    res.send("response1 ?")

});

app.use('/auth&auth',auth);

//___________SERVER______________


const port = 3050;
const host = '127.0.0.1'
var server = https.createServer(options, app);

server.listen(port, host, ()=>{

    console.log(`server listining at ${host}:${port}`)
});