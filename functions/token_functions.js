// 1-JWT example  *Take care of expiry token

const { type } = require('os');
const { jwt, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { prisma, User_Type } = require('../libraries/prisma_utilities');
const util = require('util');
const jwtVerifyAsync = util.promisify(jwt.verify);
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
    try {
        const accessToken = await generateTokenByPrivate_key(data, '4h');
        const refreshToken = await generateTokenByPrivate_key(data, '14d', TokenType.REFRESH_TOKEN);

        const accessDecoded = jwt.decode(accessToken);
        const refreshDecoded = jwt.decode(refreshToken);

        const accessExpiry = new Date(accessDecoded.exp * 1000);
        const refreshExpiry = new Date(refreshDecoded.exp * 1000);

        const updatedUser = await prisma.user.update({
            where: { User_ID: data.User_ID },
            data: {
                Refresh_Token: {
                    update: {
                        data: {
                            Refresh_Token: refreshToken,
                            Expires_At: refreshExpiry,
                        },
                    },
                },
                Session: {
                    update: {
                        data: {
                            Token: accessToken,
                            Expires_At: accessExpiry,
                        },
                    },
                },
            },
            select: {
                User_ID: true,
                Role: true,
                Employer_REO_ID: true,
                Session: {
                    select: { Token: true },
                },
                Refresh_Token: {
                    select: { Refresh_Token: true },
                },
            },
        });

        return res.status(200).json({ user_data: updatedUser, message });
    } catch (error) {
        throw error;
    }
}



const generateTokenByRefreshToken = (prisma) => async (req, res) => {
    try {

        const token = req.headers['refresh_token'];

        if (!token) {
            throw new Error('Token is required!');
        }
        console.log('token', token);
        return
        let data;
        try {
            data = await jwtVerifyAsync(token, PUBLIC_KEY);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired!');;
            } else {
                throw err;
            }
        }

        if (data.tokenType !== TokenType.REFRESH_TOKEN) {
            throw new Error('Refresh token is required!');
        }

        const resourceToken = await prisma.user.findUnique({
            where: { User_ID: data.User_ID },
            select: {
                Refresh_Tokens: { select: { Refresh_Token: true } },
            },
        });

        if (resourceToken.Refresh_Tokens?.Refresh_Token !== token) {
            throw new Error('Refresh token mismatch!');

        }

        syncTokens(data, 'Token was refreshed', res);

    } catch (error) {

        throw error;
    }
};


async function tokenVerifier(req) {

    try {

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {

            return { 'verified': false, 'message': 'token is required!' };
        }

        var resutl = jwt.verify(token, PUBLIC_KEY, async (err, data) => {

            try {
                if (err) {
                    if (err.name === 'TokenExpiredError') {

                        return new Error('Token expired!');

                        // Take action for expired token, like refreshing or prompting re-authentication
                    } else {

                        return new Error('Toekn verification failed: ', err.message);

                        // Handle other types of errors, like invalid token
                    }
                }

                if (data.tokenType !== TokenType.ACCESS_TOKEN) {
                    return { 'verified': false, 'message': 'Access token is required!' };
                }

                var user = await prisma.user.findUnique({
                    where: { User_ID: data.User_ID },
                    select: {
                        Full_Name: true,
                        Employer_REO_ID: true,
                        Session: { select: { Token: true } }
                    }
                });

                if (!user) {
                    return { 'verified': false, 'message': 'User not found!' };
                }

                if (user.Session.Token !== token) {
                    return { 'verified': false, 'message': 'Token is disposed!' };
                }

                req.body.Role = data.Role;
                req.body.User_ID = data.User_ID;
                req.body.Full_Name = user.Full_Name;
                (user.Employer_REO_ID && (req.body.Employer_REO_ID = user.Employer_REO_ID));

                return { 'verified': true, 'message': "Token is valid" };
            } catch (error) {
                console.log('tooken verifier');
                return error;
            }

        });

        return resutl;

    } catch (error) {
        console.log('tooken verifier')
        return error;
    }
}


async function tokenMiddlewere(req, res, next) {

    try {

        const result = await tokenVerifier(req);
        if (result instanceof Error) {
            res.status(401).send(result.message);
            console.log(result.message);
            return;
        }
        if (!result || !result.verified) {
            res.status(404).send(result.message);
            return;
        }
        if (req.query) {
            Object.assign(req.body, req.query);
        }
        next();

    } catch (error) {
        res.status(404).send('token middleware error!');
        console.log(error.message);
        throw error;
    }

}

// Usage
// var token = generateTokenByPrivate_key({ User_ID: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);

// token = generateTokenBySecret({ User_ID: 123, userName:"fe9lsh3ben",role: "normal user" });
// console.log('Generated Token:', token);




module.exports = {
    generateTokenByPrivate_key,
    generateTokenByRefreshToken,
    tokenVerifier,
    tokenMiddlewere,
    syncTokens,
    TokenType
}