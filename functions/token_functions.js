// 1-JWT example  *Take care of expiry token

const { jwt, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { prisma, User_Type } = require('../libraries/prisma_utilities');
require('dotenv').config();


// function generateTokenBySecret(body) {
//     const secret = process.env.JWT_SECRET; // Secret stored in environment variables
//     return jwt.sign(body.User_ID, secret, { expiresIn: '1h' });
// }

const TokenType = Object.freeze({
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
});
async function generateTokenByPrivate_key(body, period, tokenType = TokenType.ACCESS_TOKEN) {

    try {


        if (tokenType === TokenType.ACCESS_TOKEN) {

            return jwt.sign(
                {
                    User_ID: body.User_ID,
                    Username: body.Username,
                    tokenType: TokenType.ACCESS_TOKEN,
                    Role: body.Role,
                    iat: Math.floor(Date.now() / 1000),
                },
                PRIVATE_KEY,
                {
                    algorithm: 'RS256',
                    expiresIn: period,
                }
            );

        } else if (tokenType === TokenType.REFRESH_TOKEN) {

            return jwt.sign(
                {
                    User_ID: body.User_ID,
                    Username: body.Username,
                    tokenType: TokenType.REFRESH_TOKEN,
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
    } catch (error) {

    }
}

async function syncTokens(data, message, res) {

    const accessToken = await generateTokenByPrivate_key(data, '4h');
    const refreshToken = await generateTokenByPrivate_key(data, "14d", TokenType.REFRESH_TOKEN);

    var refreshDecoded = jwt.decode(refreshToken);
    var refreshExpiry = new Date(refreshDecoded.exp * 1000);
    var sessionDecoded = jwt.decode(accessToken)
    var sessionExpiry = new Date(sessionDecoded.exp * 1000);


    await prisma.user.update({
        where: { User_ID: data.User_ID },
        data: {
            Refresh_Tokens: {
                update: {
                    data: {
                        Refresh_Token: refreshToken,
                        Expires_At: refreshExpiry
                    }
                }
            },
            Session: {
                update: {
                    data: {
                        Token: accessToken,
                        Expires_At: sessionExpiry
                    }
                }
            }
        },
        select: {
            User_ID: true,
            Role: true,
            Employer_REO_ID: true,
            Session: {
                select: {
                    Token: true,
                }
            },
            Refresh_Tokens: {
                select: {
                    Refresh_Token: true,
                }
            }
        }
    }).then(async (user_data) => {

        res.status(200).send({ user_data, message });
    });
}


const generatTokenByRefreshToken = (prisma) => async (req, res) => {

    try {

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {

            res.status(404).send('token is required!');
            return

        }

        jwt.verify(token, PUBLIC_KEY, async (err, data) => {

            if (err) {
                if (err.name === 'TokenExpiredError') {

                    res.status(404).send(err.message); //message: jwt expired
                    return;

                    // Take action for expired token, like refreshing or prompting re-authentication
                } else {
                    res.status(404).send(`Refresh Token verification failed: ${err.message}`);
                    return;

                    // Handle other types of errors, like invalid token
                }
            }

            if (data.tokenType !== TokenType.REFRESH_TOKEN) {
                res.status(404).send("Refresh token is required!");
                return;
            }
            var resourceToken = await prisma.user.findUnique({ where: { User_ID: data.User_ID }, select: { Refresh_Tokens: { select: { Refresh_Token: true } } } });

            if (resourceToken.Refresh_Tokens.Refresh_Token !== token) {
                res.status(404).send("Refresh token is disposed!");
                return;
            }

            syncTokens(data, 'Token was refreshed', res);

        })

    } catch (error) {

        res.status(500).send(`Error occurred: ${error.message}`);
    }


}

async function tokenVerifier(req) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return { 'verified': false, 'message': 'token is required!' };

    }

    var resutl = jwt.verify(token, PUBLIC_KEY, async (err, data) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {

                return { 'verified': false, 'message': "jwt expired" };


                // Take action for expired token, like refreshing or prompting re-authentication
            } else {
                return { 'verified': false, 'message': `Token verification failed: ${err.message}` };

                // Handle other types of errors, like invalid token
            }
        }



        if (data.tokenType !== TokenType.ACCESS_TOKEN) {
            return { 'verified': false, 'message': "Access token is required!" };
        }

        var resourceToken = await prisma.user.findUnique({ where: { User_ID: data.User_ID }, select: { Session: { select: { Token: true } } } });

        if (resourceToken.Session.Token !== token) {
            return { 'verified': false, 'message': "Token is disposed!" };
        }

        req.body.User_ID = data.User_ID;
        req.body.Role = data.Role;
        return { 'verified': true, 'message': "Token is valid" };



    });
    return resutl;

}


async function tokenMiddlewere(req, res, next) {
    const result = await tokenVerifier(req);
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




module.exports = {
    generateTokenByPrivate_key,
    generatTokenByRefreshToken,
    tokenVerifier,
    tokenMiddlewere,
    syncTokens,
    TokenType
}