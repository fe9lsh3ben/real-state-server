const { dbErrorHandler, mapAddressToScalars } = require("../libraries/utilities");
const { jwt, argon2 } = require("../libraries/authTools_lib");
const { generateTokenByPrivate_key, TokenType, generateTokenByRefreshToken } = require("../functions/token_functions");
const crypto = require('crypto');
const signup = (prisma) => async (req, res) => {
    let user;
    try {
        // Hash password
        const hashedPass = await argon2.hash(req.body.Password);
        req.body.Password = hashedPass;

        let body = req.body;
        if (!body.TC_ID || !String(body.TC_ID).includes('B')) {
            return res.status(400).send({ 'message': 'Terms and Conditions not found.' });
        }
        if (!body.Address) {
            return res.status(400).send({ 'message': 'Address is required.' });
        }
        const mapped = mapAddressToScalars(body.Address);
        Object.assign(body, mapped);
        // Create user
        user = await prisma.user.create({
            data: {
                TermsAndCondition: { connect: { TC_ID: body.TC_ID } },
                Username: body.Username,
                Email: body.Email,
                Password: body.Password,
                Gov_ID: body.Gov_ID,
                Region: body.Region,
                City: body.City,
                Longitude: body.Longitude,
                Full_Name: body.Full_Name,
                User_Phone: body.User_Phone,
            },
        });
        // Generate tokens
        const accessToken = await generateTokenByPrivate_key(user, "4h");
        const refreshToken = await generateTokenByPrivate_key(user, "14d", TokenType.REFRESH_TOKEN);

        // Decode tokens for expiry
        let decoded = jwt.decode(refreshToken);
        const refreshExpiry = new Date(decoded.exp * 1000);
        // Store refresh token
        const storedRefresh = await prisma.refreshToken.create({
            data: {
                Refresh_Token: refreshToken,
                User: { connect: { User_ID: user.User_ID } },
                Expires_At: refreshExpiry,
            },
        });

        decoded = jwt.decode(accessToken);
        const accessExpiry = new Date(decoded.exp * 1000);
        // Store session with access token
        const storedSession = await prisma.Session.create({
            data: {
                User: { connect: { User_ID: user.User_ID } },
                Token: accessToken,
                Expires_At: accessExpiry,
            },
        });

        if (req.headers['x-mobile-app']) {
            return res.status(201).send({
                data: {
                    user,
                    token: storedSession.Token,
                    refresh_token: storedRefresh.Refresh_Token
                },
                message: "User created successfully"
            });
        }


        res.cookie("session", storedSession.Token, {
            httpOnly: false,
            sameSite: "none", // none, lax or strict
            secure: true,     // set to true in prod with https
            maxAge: 1000 * 60 * 60 * 4,
        });

        res.cookie("refreshToken", storedRefresh.Refresh_Token, {
            httpOnly: false,
            sameSite: "none", // none, lax or strict
            secure: true,
            // path: "/profile/renew_token",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });


        // Generate CSRF token (random string)
        const csrfToken = crypto.randomBytes(32).toString("hex");
        // Send CSRF token to client (readable by JS)
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            sameSite: "none",
            secure: true, // set true if using HTTPS
            maxAge: 1000 * 60 * 60 * 4,
        });

        delete user.Password;

        // Send response
        return res.status(201).send({
            message: "User created successfully",
            csrfToken,
            data: user,
        });

    } catch (error) {
        if (typeof user !== "undefined" && user?.User_ID) {
            console.log('Rolling back: deleting partially created user...');
            await prisma.Session.findUnique({ where: { User_ID: user.User_ID } }).then(async (session) => {
                if (session) {
                    await prisma.Session.delete({ where: { User_ID: user.User_ID } });
                }
            });
            await prisma.refreshToken.findUnique({ where: { User_ID: user.User_ID } }).then(async (refreshToken) => {
                if (refreshToken) {
                    await prisma.refreshToken.delete({ where: { User_ID: user.User_ID } });
                }
            });
            await prisma.user.findUnique({ where: { User_ID: user.User_ID } }).then(async (user) => {
                if (user) {
                    await prisma.user.delete({ where: { User_ID: user.User_ID } });
                }
            });
            console.log('Rollback complete.');

            console.log('Error occurred and user was deleted. \n Error: ', error);
        }

        dbErrorHandler(res, error, "signup");
        console.error(error.message);

    }
};


const login = (prisma) => async (req, res) => {
    try {
        const { Username, Password } = req.body;

        // Find user by username
        const user = await prisma.user.findUnique({
            where: { Username },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const validPassword = await argon2.verify(user.Password, Password);
        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        // Generate tokens
        const accessToken = await generateTokenByPrivate_key(user, '4h');
        const refreshToken = await generateTokenByPrivate_key(user, '14d', TokenType.REFRESH_TOKEN);

        // Decode tokens for expiry dates
        let decoded = jwt.decode(accessToken);
        const accessExpiry = new Date(decoded.exp * 1000);

        decoded = jwt.decode(refreshToken);
        const refreshExpiry = new Date(decoded.exp * 1000);

        // Update session
        const updatedUser = await prisma.user.update({
            where: { User_ID: user.User_ID },
            data: {
                Session: {
                    update: {
                        Token: accessToken,
                        Expires_At: accessExpiry,
                    },
                },
                Refresh_Token: {
                    update: {
                        Refresh_Token: refreshToken,
                        Expires_At: refreshExpiry,
                    },
                },
            },
            select: {
                User_ID: true,
                Role: true,
                Full_Name: true,
                Profile_Image: true,
                User_Phone: true,
                Session: {
                    select: {
                        Token: true,
                        Expires_At: true,
                    },
                },
                Refresh_Token: {
                    select: {
                        Refresh_Token: true,
                        Expires_At: true,
                    },
                },
                RE_Offices: {
                    select: {
                        Office_ID: true,
                        Office_Name: true,
                        Office_Phone: true,
                        Office_Image: true,
                        Office_Banner_Image: true,
                        Region: true,
                        City: true,
                        District: true,
                        Direction: true,
                        Latitude: true,
                        Longitude: true,
                        Other: true,
                    },
                },
            }
        });
        if (req.headers['x-mobile-app']) {
            return res.status(201).send({
                data: {
                    ...updatedUser,
                    token: updatedUser.Session.Token,
                    refresh_token: updatedUser.Refresh_Token.Refresh_Token,
                },
                message: 'Login successful',
            });
        }


        res.cookie("session", updatedUser.Session.Token, {
            httpOnly: false,
            sameSite: "none",
            secure: true,     // set to true in prod with https
            maxAge: 1000 * 60 * 60 * 4,
        });

        res.cookie("refreshToken", updatedUser.Refresh_Token.Refresh_Token, {
            httpOnly: false,
            sameSite: "none",
            secure: true,
            // path: "/profile/renew_token",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        const csrfToken = crypto.randomBytes(32).toString("hex");
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            sameSite: "none",
            secure: true,
            maxAge: 1000 * 60 * 60 * 4,
        });
        // Send response
        return res.status(201).send({
            message: 'Login successful',
            csrfToken,
            data: updatedUser
        });


    } catch (error) {
        dbErrorHandler(res, error, 'login');
        console.error(error.message);
    }
};




const becomeOfficeStaff = (prisma, User_Type) => async (req, res) => {


    try {

        if (req.body.Role === User_Type.REAL_ESTATE_OFFICE_STAFF) {
            return res.status(400).send({ 'message': 'You are already an office staff!' });
        }

        user = await prisma.user.findUnique({
            where: { User_ID: req.body.User_ID },
            select: { Role: true },
        });

        if (!user) {
            return res.status(404).send({ 'message': 'User not found.' });
        }

        if (user.Role === User_Type.REAL_ESTATE_OFFICE_STAFF) {
            return res.status(400).send({ 'message': 'You are already an office staff!' });
        }

        await prisma.user.update({
            where: { User_ID: req.body.User_ID },
            data: { Role: User_Type.REAL_ESTATE_OFFICE_STAFF },
        });

        // Call your token refresh function - double-check function name and usage!
        await generateTokenByRefreshToken(prisma)(req, res);

    } catch (error) {

        dbErrorHandler(res, error, 'become office staff');

        if (typeof user !== "undefined") {
            console.log('Error occurred and user deleted');
            await prisma.user.update({
                where: { User_ID: req.body.User_ID },
                data: { Role: User_Type.BENEFICIARY },
            });
        }
        console.error(error.message);
    }
};



const get_Profile = (prisma) => async (req, res) => {
    try {
        const profile = await prisma.user.findUnique({
            where: { User_ID: req.body.User_ID },
            select: {
                User_ID: true,
                Role: true,
                Email: true,
                Profile_Image: true,
                Gov_ID: true,
                Region: true,
                City: true,
                Full_Name: true,
                User_Phone: true,
                Other1: true,
                Employer_REO_ID: true,
                Username: true,
                Balance: true,
                Fal_Licenses: true,
                RE_Offices: {
                    select: {
                        Office_ID: true,
                    },
                },
            },
        });

        if (!profile) {
            return res.status(404).send({ 'message': 'Profile not found.' });
        }

        return res.status(200).send(profile);
    } catch (error) {
        console.log(error);
        dbErrorHandler(res, error, 'get profile');
    }
};

const get_Custom_Profile = (prisma) => async (req, res) => {
    try {
        const {
            User_ID,
            Role,
            Email,
            Profile_Image,
            Gov_ID,
            Region,
            City,
            Full_Name,
            User_Phone,
            Other1,
            Employer_REO_ID,
            Username,
            Balance,
            RE_Offices
        } = req.body;

        const selectedFields = {
            ...(Role && { Role: true }),
            ...(Email && { Email: true }),
            ...(Profile_Image && { Profile_Image: true }),
            ...(Gov_ID && { Gov_ID: true }),
            ...(Region && { Region: true }),
            ...(City && { City: true }),
            ...(Full_Name && { Full_Name: true }),
            ...(User_Phone && { User_Phone: true }),
            ...(Other1 && { Other1: true }),
            ...(Employer_REO_ID && { Employer_REO_ID: true }),
            ...(Username && { Username: true }),
            ...(Balance && { Balance: true }),
            ...(RE_Offices && {
                RE_Offices: {
                    select: {
                        Office_ID: true,
                    },
                },
            }),
            User_ID: true,
        };

        const profile = await prisma.user.findUnique({
            where: { User_ID: User_ID },
            select: selectedFields,
        });

        if (!profile) {
            return res.status(404).send({ 'message': 'Profile not found.' });
        }

        return res.status(200).send(profile);
    } catch (error) {
        console.error(error);
        dbErrorHandler(res, error, 'get profile');
    }
};


const edit_Profile = (prisma) => async (req, res) => {
    try {
        const address = req.body.Address;
        const hasAddressFields = address &&
            (address.Region || address.City);

        if (!(req.body.Email || req.body.Profile_Image || hasAddressFields || req.body.Other1)) {
            return res.status(400).send({ 'message': 'Nothing to change?!...' });
        }

        const updateData = {};
        if (req.body.Email) updateData.Email = req.body.Email;
        if (req.body.Profile_Image) updateData.Profile_Image = req.body.Profile_Image;
        if (address.Region) updateData.Region = address.Region;
        if (address.City) updateData.City = address.City;
        if (req.body.Other1) updateData.Other1 = req.body.Other1;

        const updatedProfile = await prisma.user.update({
            where: { User_ID: req.body.User_ID },
            data: updateData,
            select: {
                User_ID: true,
                Role: true,
                Username: true,
                Email: true,
                Profile_Image: true,
                Gov_ID: true,
                Region: true,
                City: true,
                Full_Name: true,
                User_Phone: true,
                Other1: true,
                Employer_REO_ID: true,
                Balance: true,
                Fal_Licenses: { select: { License_ID: true, Fal_License_Number: true } },
            },
        });

        return res.status(202).json({
            message: 'Data was updated',
            data: updatedProfile,
        });
    } catch (error) {
        dbErrorHandler(res, error, 'edit profile');
    }
};

const logout = (prisma) => async (req, res) => {
    try {

        await prisma.user.update({
            where: { User_ID: req.body.User_ID },
            data: {
                Session: {
                    update: {
                        Token: null,
                        Expires_At: null,
                        Revoked_At: new Date()
                    },
                },
                Refresh_Token: {
                    update: {
                        Refresh_Token: null,
                        Expires_At: null,
                        Revoked_At: new Date()
                    },
                },
            },
        });
        if (req.headers['x-mobile-app']) {
            return res.status(200).send({ 'message': 'Logout successful' });
        }
        res.clearCookie('session');
        res.clearCookie('refreshToken');
        res.clearCookie('csrfToken');
        res.status(200).send({ 'message': 'Logout successful' });
    } catch (error) {
        console.error(error);
        dbErrorHandler(res, error, 'logout');
    }
};

module.exports = {
    signup,
    login,
    becomeOfficeStaff,
    get_Profile,
    get_Custom_Profile,
    edit_Profile,
    logout
}