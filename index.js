//___________Utilities______________
const {
    cookieParser,
    express, https, http, cors, fs } = require('./libraries/utilities')


/**
 * --registry=https://registry.npmmirror.com  For error : -
 * 
 * node:internal/modules/cjs/loader:1479
  throw err;
  ^

Error: Cannot find module 'nodemailer'


 at Module._resolveFilename (node:internal/modules/cjs/loader:1476:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1049:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1073:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1094:12)
    at Module._load (node:internal/modules/cjs/loader:1262:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1576:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (C:\Users\sora\Develop\Projects\Backend\real-state-server\functions\2-Profile_functions.js:7:20)
    at Module._compile (node:internal/modules/cjs/loader:1830:14) {
  code: 'MODULE_NOT_FOUND',
 */

//___________SERVER SETTINGS______________

var app = express()
app.use(cors({
    origin: 'http://localhost:51727',
    credentials: true,
    allowedHeaders: [
        "x-csrf-token",
        "x-mobile-app",
        "Origin",
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
        "X-Amz-Security-Token",
        "locale"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));


app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));



//___________TLS CRADENTIALS______________

var options = {
    /** Work */ key: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2-key.pem'),
    /** Work */ cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/home_localhost+2.pem'),
    /** Home */ //key: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2-key.pem'),
    /** Home *///cert: fs.readFileSync('./real_state_TSL_cradentiales_Home/localhost+2.pem')
};




//___________Modules______________



const {
    T_AND_C,
    profile,
    REO,
    FalLicense,
    REU,
    Contract,
    RE_AD,
    Notification

} = require('./libraries/routes_lib');


app.use('/terms-and-conditions', T_AND_C);


app.use('/profile', profile);


app.use('/REO', REO);


app.use('/falLicense', FalLicense);


app.use('/REU', REU);


app.use('/RE_AD', RE_AD)


app.use('/contract', Contract);

app.use('/notification', Notification);

app.get('/', (req, res) => {
    res.status(200).send({ 'message': 'Server is running!' });
})


//___________SERVER______________


const port = 3050;
const host = '0.0.0.0';
var server = http.createServer(options, app);

server.listen(port, host, () => {
    console.log(`server listining at ${host}:${port}`)
});


/**
 * in native flutter app send request with header as follows:
 * 
 * await http.post(
  Uri.parse("https://example.com/login"),
  headers: {
  "X-Mobile-App": "true", // Set the X-Mobile-App header
  "refresh_token": "Bearer refresh_token", // the form of refresh token in native app
  "authorization": "Bearer access_token", // the form of access token in native app
  },
  body: {...},
);

 * in web app send requests with x-csrf-token header:

 *await http.post(
  Uri.parse("https://example.com/login"),
  headers: {
  "x-csrf-token": "Bearer csrf-token"
  },
  body: {...},  
 

 */