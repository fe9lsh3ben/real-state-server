// 1-JWT example  *Take care of expiry token

const { jwt, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { prisma } = require('../libraries/prisma_utilities');
require('dotenv').config();


// function generateTokenBySecret(body) {
//     const secret = process.env.JWT_SECRET; // Secret stored in environment variables
//     return jwt.sign(body.User_ID, secret, { expiresIn: '1h' });
// }


function generateTokenByPrivate_key(body, period) {

    return jwt.sign(
        {
            User_ID: body.User_ID,
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

const  generatTokenByRefreshToken = (prisma) => async (req, res)  => {

    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    
    if (!refreshToken) {

        return { 'verified': false, 'message': 'toke is required!' };
        
    }

    jwt.verify(refreshToken, PUBLIC_KEY, async (err, data) => {
        
        if (err) {
            if (err.name === 'TokenExpiredError') {
                
                res.status(404).json({ 'verified': false, 'message': err.message }); //message: jwt expired
                return;

                // Take action for expired token, like refreshing or prompting re-authentication
            } else {
                res.status(404).json({ 'verified': false, 'message': `Refresh Token verification failed: ${err.message}` });
                return;

                // Handle other types of errors, like invalid token
            }
        }
        
        var accessToken = generateTokenByPrivate_key(data,"4h");
        var refreshToken = generateTokenByPrivate_key(data,"14d");
        var decoded = jwt.decode(refreshToken);
        var expiryDate = new Date(decoded.exp * 1000);
       
        // console.log(expiryDate);
        // console.log(Date())
        await prisma.User.update({
            where: { User_ID: data.User_ID },
            data:{
                RefreshTokens:{
                    update: {
                        data: {
                            RefreshToken: refreshToken,
                            ExpiresAt: expiryDate
                        }
                    }
                }
            }
        });




        decoded = jwt.decode(accessToken)
        expiryDate = new Date(decoded.exp * 1000);

        await prisma.User.update({
            where: { User_ID: data.User_ID },
            data:{
                Session:{
                    update: {
                        data: {
                            Token: accessToken,
                            ExpiresAt: expiryDate
                        }
                    }
                }
            }
        });


        res.status(200).send({
            data: data,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
        
        
    }); 





}

function tokenVerifier(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return {'verified': false, 'message': 'toke is required!' };

    }

    jwt.verify(token, PUBLIC_KEY, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {

                return { 'verified': false, 'message': "jwt expired" };


                // Take action for expired token, like refreshing or prompting re-authentication
            } else {
                return { 'verified': false, 'message': `Token verification failed: ${err.message}`};

                // Handle other types of errors, like invalid token
            }
        }

        req.body.User_ID = user.User_ID; // Attach the user to the request object
        
    });


}


function tokenMiddlewere(req, res, next) {
    const result = tokenVerifier(req);
    if (!result.verified) {
        res.status(404).send(result.message);
        return;
    }


    next();

}

// Usage
// var token = generateTokenByPrivate_key({ User_ID: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);

// token = generateTokenBySecret({ User_ID: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);




module.exports = { generateTokenByPrivate_key, generatTokenByRefreshToken, tokenVerifier, tokenMiddlewere }