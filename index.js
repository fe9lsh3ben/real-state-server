var express = require('express');
var https = require('https');
var cors = require('cors');
var fs = require('fs');

//___________SERVER SETTINGS______________


var app = express()

app.use(cors({credentials: true}))


//___________TLS CRADENTIALS______________


var options = {
    key: fs.readFileSync('./teal_state_TSL_cradentiales/localhost+2-key.pem'),
    cert: fs.readFileSync('./teal_state_TSL_cradentiales/localhost+2.pem')};


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