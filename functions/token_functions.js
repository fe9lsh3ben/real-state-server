// 1-JWT example  *Take care of expiry token

const {jwt, PRIVATE_KEY, PUBLIC_KEY} = require('../libraries/authTools_lib');
require('dotenv').config();


// function generateTokenBySecret(body) {
//     const secret = process.env.JWT_SECRET; // Secret stored in environment variables
//     return jwt.sign(body.userId, secret, { expiresIn: '1h' });
// }


function generateTokenByPrivate_key(body, period){
    
    return jwt.sign(
        {
            ID: body.ID,
            Username: body.Username,
            Role: body.Role,
            iat: Math.floor(Date.now() / 1000),
        },
        PRIVATE_KEY,
        {
            algorithm: 'RS256',
            expiresIn: period,
        }
    );
}



// Verify a JWT token


// function verifyTokenBySecret(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     const secret = process.env.JWT_SECRET;
   
//         return jwt.verify(token, secret,(err, user)=>{
//             if (err) {
//                 return res.status(403).json({ message: 'Invalid or expired token' });
//             }
//             req.user = user; // Attach the user to the request object
//             next();
//         });
    
// }

function verifyTokenByPublic_Key(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, PUBLIC_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user.ID = user.ID; // Attach the user to the request object
        next();
    });
}



// Usage
// var token = generateTokenByPrivate_key({ userId: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);

// token = generateTokenBySecret({ userId: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);


const renewAccessToken = (refrshToken) =>{
     
}



module.exports = { generateTokenByPrivate_key, verifyTokenByPublic_Key}