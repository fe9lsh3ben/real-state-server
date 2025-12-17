// 1-JWT example  *Take care of expiry token

const { type } = require('os');
const { jwt, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { prisma, User_Type } = require('../libraries/prisma_utilities');
const crypto = require('crypto');
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

async function syncTokens(req, user, content, res) {
    try {
        const accessToken = await generateTokenByPrivate_key(user, '4h');
        const refreshToken = await generateTokenByPrivate_key(user, '14d', TokenType.REFRESH_TOKEN);

        const accessDecoded = jwt.decode(accessToken);
        const refreshDecoded = jwt.decode(refreshToken);

        const accessExpiry = new Date(accessDecoded.exp * 1000);
        const refreshExpiry = new Date(refreshDecoded.exp * 1000);
        const updatedUser = await prisma.user.update({
            where: { User_ID: user.User_ID },
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

        if (req.headers['x-mobile-app']) {
            return res.status(201).send({
                user_data: updatedUser,
                message: content.message
            });

        }

        res.cookie("session", updatedUser.Session.Token, {
            httpOnly: false,
            sameSite: "none", // none, lax or strict
            secure: true,     // set to true in prod with https
            maxAge: 1000 * 60 * 60 * 4,
        });

        res.cookie("refreshToken", updatedUser.Refresh_Token.Refresh_Token, {
            httpOnly: false,
            sameSite: "none", // none, lax or strict
            secure: true,
            path: "/profile/renew_token",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        // Generate CSRF token (random string)
        const csrfToken = crypto.randomBytes(32).toString("hex");


        // Send CSRF token to client (readable by JS)
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false, // JS can read it
            sameSite: "lax",
            secure: false, // set true if using HTTPS
            maxAge: 1000 * 60 * 60 * 4,
        });


        delete updatedUser.Session;
        delete updatedUser.Refresh_Token;
        return res.status(201).json({
            csrfToken: csrfToken,
            user_data: updatedUser,
            office_content: content.office_content,
            message: content.message,
            note: content.note
        });

    } catch (error) {
        throw error;
    }
}



const generateTokenByRefreshToken = (prisma) => async (req, res) => {
    try {
        let token;
        if (req.cookies.refreshToken) {
            token = req.cookies.refreshToken;
        } else {
            const authHeader = req.headers['refresh_token'];
            token = authHeader && authHeader.split(' ')[1];
        }
        if (!token) {
            return res.status(401).send({ 'message': 'Refresh token is required!' });
        }

        let data;
        try {
            data = await jwtVerifyAsync(token, PUBLIC_KEY);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                if (req.headers['x-mobile-app']) {
                    return res.status(401).send({ 'message': 'Token expired!' });
                }
                return res.redirect("/login");
            } else {
                console.log(err);
                return res.status(401).send({ 'message': 'error occured!' });
            }
        }

        if (data.tokenType !== TokenType.REFRESH_TOKEN) {
            return res.status(401).send({ 'message': 'Invalid token type!' });
        }

        const resourceToken = await prisma.user.findUnique({
            where: { User_ID: data.User_ID },
            select: {
                Refresh_Token: { select: { Refresh_Token: true } },
            },
        });
        if (resourceToken.Refresh_Token?.Refresh_Token !== token) {
            return res.status(401).send({ 'message': 'Invalid refresh token!' });

        }
        syncTokens(req, data, 'Token was refreshed', res);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ 'message': 'error occured!' });
    }
};


async function tokenVerifier(req) {

    try {

        let token;
        if (req.cookies.session) {
            token = req.cookies.session;
        } else {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1];
        }

        if (!token) {
            return { 'verified': false, 'message': 'no token' };
        }

        var resutl = jwt.verify(token, PUBLIC_KEY, async (err, data) => {

            try {
                if (err) {
                    if (err.name === 'TokenExpiredError') {

                        return { 'verified': false, 'message': 'Token expired!' };

                        // Take action for expired token, like refreshing or prompting re-authentication
                    } else {

                        return { 'verified': false, 'message': err.message };

                        // Handle other types of errors, like invalid token
                    }
                }

                if (data.tokenType !== TokenType.ACCESS_TOKEN) {
                    return { 'verified': false, 'message': 'Access token is required!' };
                }

                var user = await prisma.user.findUnique({
                    where: { User_ID: data.User_ID },
                    select: {
                        User_ID: true,
                        Role: true,
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
                if (req.body === undefined) {
                    req.body = {};
                }
                req.body.Role = user.Role;
                req.body.User_ID = user.User_ID;
                req.body.Full_Name = user.Full_Name;
                (user.Employer_REO_ID && (req.body.Employer_REO_ID = user.Employer_REO_ID));

                return { 'verified': true, 'message': "Token is valid" };
            } catch (error) {
                console.log(error.message);
                console.log('jwt verifier');
                return { 'verified': false, 'message': error.message };
            }

        });

        return resutl;

    } catch (error) {
        console.log('tooken verifier')
        return { 'verified': false, 'message': error.message };
    }
}


async function tokenMiddlewere(req, res, next) {

    try {

        if (!req.headers['x-mobile-app']) {
            
            if (!req.cookies.refreshToken || !req.cookies.session) {
                return res.status(401).send({ message: "No session or refresh tokens found" });
            }
            const csrfCookie = req.cookies.csrfToken;
            const csrfHeader = req.headers["x-csrf-token"];

            if (!csrfHeader || csrfHeader !== csrfCookie) {
                const csrfToken = crypto.randomBytes(32).toString("hex");
                res.cookie("csrfToken", csrfToken, {
                    httpOnly: false, // JS can read it
                    sameSite: "lax",
                    secure: false, // set true if using HTTPS
                    maxAge: 1000 * 60 * 60 * 4,
                });

                return res.status(403).send({ message: "Invalid CSRF token", csrfToken });
            }
        }

        const result = await tokenVerifier(req);
        if (result instanceof Error) {
            res.status(401).send(result.message);
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
        res.status(404).send({ message: 'token middleware error!' });
        console.log(error.message);
        throw error;
    }

}


const checkToken = () => async (req, res) => {
    let verification = await tokenVerifier(req);
    if (!verification.verified) return res.status(401).send(verification);
    res.status(200).send();
}

module.exports = {
    generateTokenByPrivate_key,
    generateTokenByRefreshToken,
    tokenVerifier,
    tokenMiddlewere,
    syncTokens,
    checkToken,
    TokenType
}