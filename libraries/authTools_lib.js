
// ____________________Modules________________________

const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const fs = require('fs');



//___________________Libraries___________________



//___________________Credentials_________________

const PRIVATE_KEY = fs.readFileSync('./private_key.pem', 'utf8');
const PUBLIC_KEY = fs.readFileSync('./public_key.pem', 'utf8');




module.exports = {
    jwt,
    argon2,
    PRIVATE_KEY,
    PUBLIC_KEY,
}