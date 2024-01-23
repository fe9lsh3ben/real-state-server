var express = require('express');
const bcrypt = require('bcrypt');
var https = require('https');
var http = require('http');
var cors = require('cors');
var fs = require('fs');

//___________SERVER SETTINGS______________


var app = express()

app.use(cors({
    origin:"*",
    credentials: true,
    allowedHeaders: "Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,locale"}));


//___________TLS CRADENTIALS______________


var options = {
    //key: fs.readFileSync('../localhost+2-key.pem'),
    //cert: fs.readFileSync('../localhost+2.pem'),
    /** Home */ key: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2-key.pem'),
    /** Home */cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2.pem')
};


//___________ROUTS______________


app.get('/', (req,res)=>{

    console.log(req.body);
    res.send({'status':'ok'});

});


//___________SERVER______________


const port = 3050;
const host = '127.0.0.1'
var server = https.createServer(options, app);

server.listen(port, host, ()=>{

    console.log(`server listining at ${host}:${port}`)
});