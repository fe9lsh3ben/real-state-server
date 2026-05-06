const { dbErrorHandler, mapAddressToScalars } = require("../libraries/utilities");
const { jwt, argon2 } = require("../libraries/authTools_lib");
const { generateTokenByPrivate_key, TokenType, generateTokenByRefreshToken } = require("../functions/token_functions");
const { Office_Or_User_Status, Office_Bundle_Name } = require('../libraries/prisma_utilities');
const { syncTokens, tokenMiddlewere } = require('./token_functions');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const { Session } = require("inspector/promises");
const validator = require("validator");

const signup = (prisma) => async (req, res) => {

    const { Entity_Type } = req.body;

    if (Entity_Type === "User") {
        let user;
        try {
            const {
                User_Phone, //required
                Password, //required
                Address, //required
                Email,
                Username,
                TC_ID,
                Full_Name,
            } = req.body;

            if (!TC_ID || !String(TC_ID).includes('B')) {
                return res.status(400).send({ 'message': 'Terms and Conditions not found.' });
            }

            const missingFields = [];
            if (!User_Phone) missingFields.push("User Phone");
            if (!Password) missingFields.push("Password");
            if (!Address) missingFields.push("Address");

            if (missingFields.length > 0) {
                return res.status(400).send({ 'message': `Missing required fields: ${missingFields.join(", ")}` });
            }

            if (Email && !validator.isEmail(Email)) {
                return res.status(400).send({ 'message': 'enter valid email' });

            }

            if (Username && !validator.isAlphanumeric(Username)) {
                return res.status(400).send({ 'message': 'Username entry should be letters and numaric only!' });
            }

            if (Full_Name) {
                for (var namePart of Full_Name) {
                    if (!validator.isAlpha(namePart)) {
                        return res.status(400).send({ 'message': 'name should be letters only!' });

                    }
                }
            }

            if (!validator.isNumeric(User_Phone)) {
                return res.status(400).send({ 'message': 'User Phone should be numaric entry' });
            }

            const takenUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { User_Phone: User_Phone },
                        ...(Username && [{ Username: Username }]),
                        ...(Email && [{ Email: Email }])
                    ]
                }
            });

            if (takenUser) {
                if (takenUser.User_Phone === User_Phone) {
                    return res.status(400).send({ 'message': "User Phone is already taken." });
                } else if (takenUser.Username === Username) {
                    return res.status(400).send({ 'message': "Username is already taken." });
                } else if (takenUser.Email === Email) {
                    return res.status(400).send({ 'message': "Email is already taken." });
                }
            }

            // Hash password
            const hashedPass = await argon2.hash(Password);
            Password = hashedPass;

            const { Region, City } = Address;
            // Create user

            user = await prisma.user.create({
                data: {
                    TermsAndCondition: { connect: { TC_ID: TC_ID } },
                    ...(Username && { Username: Username }),
                    Email: Email,
                    Password: Password,
                    Region: Region,
                    City: City,
                    ...(Full_Name && { Full_Name: Full_Name }),
                    User_Phone: User_Phone,
                },
            });
            // Generate tokens
            const accessToken = await generateTokenByPrivate_key('User', user, '4h');
            const refreshToken = await generateTokenByPrivate_key('User', user, '14d', TokenType.REFRESH_TOKEN);

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
        }
        catch (error) {

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

            dbErrorHandler(res, error, "user signup");
            console.error('Error:', error.message);
        }



    } else if (Entity_Type === "Office") {
        let createdOffice;
        try {
            const {
                Commercial_Register, //required
                Password, //required
                Office_Name, //required
                Office_Phone, //required
                Office_Image, //required
                Address, //required
                TC_ID, //required
                Office_Banner_Image,
                Other,
            } = req.body;

            // Validate required fields
            if (!TC_ID || !String(TC_ID).includes('OO')) {
                return res.status(400).send({ 'message': 'Terms and Conditions not found.' });
            }

            const missingFields = [];
            if (!Commercial_Register) missingFields.push("Commercial Register");
            if (!Password) missingFields.push("Password");
            if (!Office_Name) missingFields.push("Office Name");
            if (!Office_Phone) missingFields.push("Office Phone");
            if (!Office_Image) missingFields.push("Office Image");
            if (!Address) missingFields.push("Address");

            if (missingFields.length > 0) {
                return res.status(400).send(`Missing required fields: ${missingFields.join(", ")}`);
            }

            if (!validator.isNumeric(Office_Phone)) {
                return res.status(400).send({ 'message': 'Office Phone should be numaric entry' });
            }

            const takenOffice = await prisma.realEstateOffice.findFirst({
                where: {
                    OR: [
                        { Commercial_Register: Commercial_Register },
                        { Office_Name: Office_Name }
                    ]
                }
            });

            if (takenOffice) {
                if (takenOffice.Commercial_Register === Commercial_Register) {
                    return res.status(400).send({ 'message': "Commercial Register is already assigned." });
                } else if (takenOffice.Office_Name === Office_Name) {
                    return res.status(400).send({ 'message': "Office Name is already taken." });
                }
            }
            // Hash password
            const hashedPass = await argon2.hash(Password);
            req.body.Password = hashedPass;

            const { Region, City, District, Direction, Latitude, Longitude } = Address;

            const dataEntry = {
                TermsAndCondition: { connect: { TC_ID: TC_ID } },
                Commercial_Register,
                Office_Name,
                Office_Phone,
                Password: hashedPass,
                Bundle: { connect: { BundleName: Office_Bundle_Name.FREE_BUNDLE } },
                Region,
                City,
                District,
                Direction,
                Latitude,
                Longitude,
                Status: Office_Or_User_Status.ACTIVE,
                Other:{'Services':''},
            };

            try {
                let binaryBuffer = Buffer.from(Office_Image, 'base64');
                let sizeInBytes = await sharp(binaryBuffer).jpeg({ quality: 60 }).toBuffer();

                if (sizeInBytes.length > 2 * 1024 * 1024) {
                    return res.status(400).send({ 'message': "Office Image is more than 2MB" });
                }

                dataEntry.Office_Image = Buffer.from(sizeInBytes, 'base64');

                if (Office_Banner_Image) {
                    sizeInBytes = Buffer.from(Office_Banner_Image, 'base64');
                    if (sizeInBytes.length > 5 * 1024 * 1024) {
                        return res.status(400).send({ 'message': "Office Banner Image is more than 5MB" });
                    }
                    dataEntry.Office_Banner_Image = Buffer.from(Office_Banner_Image, 'base64');
                }
            }
            catch (e) {
                console.log(e);
                return res.status(400).send({ 'message': "Office Image or Office Banner Image is not valid" });
            }
            createdOffice = await prisma.realEstateOffice.create({
                data: dataEntry,
                select: {
                    Office_ID: true,
                    Region: true,
                    City: true,
                    District: true,
                    Direction: true,
                    Latitude: true,
                    Longitude: true,
                    Office_Name: true,
                    Office_Image: true,
                    Office_Phone: true,
                    Office_Banner_Image: true,
                    Other: true,
                    Status: true
                }
            });
            createdOffice.My_Office_ID = createdOffice.Office_ID;
            delete createdOffice.Office_ID;


            const accessToken = await generateTokenByPrivate_key('Office', createdOffice, '4h');
            const refreshToken = await generateTokenByPrivate_key('Office', createdOffice, '14d', TokenType.REFRESH_TOKEN);

            // Decode tokens for expiry
            let decoded = jwt.decode(refreshToken);
            const refreshExpiry = new Date(decoded.exp * 1000);

            // Store refresh token
            const storedRefresh = await prisma.refreshToken.create({
                data: {
                    Refresh_Token: refreshToken,
                    Office: { connect: { Office_ID: createdOffice.My_Office_ID } },
                    Expires_At: refreshExpiry,
                },
            });

            decoded = jwt.decode(accessToken);
            const accessExpiry = new Date(decoded.exp * 1000);
            // Store session with access token
            const storedSession = await prisma.Session.create({
                data: {
                    Office: { connect: { Office_ID: createdOffice.My_Office_ID } },
                    Token: accessToken,
                    Expires_At: accessExpiry,
                },
            });

            if (req.headers['x-mobile-app']) {
                return res.status(201).send({
                    data: {
                        createdOffice,
                        token: storedSession.Token,
                        refresh_token: storedRefresh.Refresh_Token
                    },
                    message: "Office created successfully"
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

            delete createdOffice.Password;

            // Send response
            return res.status(201).send({
                message: "Office created successfully",
                csrfToken,
                data: createdOffice,
            });
        } catch (error) {
            console.log('Error:', error.message);
            // Rollback if partial entity was created
            if (typeof createdOffice !== 'undefined' && createdOffice?.My_Office_ID) {
                try {
                    console.log('Rolling back: deleting partially created office...');
                    await prisma.realEstateOffice.findUnique({
                        where: { Office_ID: createdOffice.My_Office_ID },
                    }).then(async (office) => {
                        if (office) {
                            await prisma.realEstateOffice.delete({
                                where: { Office_ID: createdOffice.My_Office_ID },
                            });
                        }
                    });
                    console.log('Rollback successful.');
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError.message);
                }
            }

            dbErrorHandler(res, error, 'REO signup');
            console.error('Error:', error.message);


        };

    }
}

const login = (prisma) => async (req, res) => {

    const { Entity_Type } = req.body;

    if (Entity_Type === "Office") {

        try {
            // Find user by username
            const { Commercial_Register, Password } = req.body;
            let office;
            try {

                office = await prisma.realEstateOffice.findUnique({
                    where: { Commercial_Register: Commercial_Register },
                    select: {
                        Office_ID: true,
                        Password: true
                    }
                });

                if (!office) {
                    return res.status(404).json({ message: 'User not found' });
                }

                // Verify password
                const validPassword = await argon2.verify(office.Password, Password);
                if (!validPassword) {
                    return res.status(403).json({ message: 'Invalid password' });
                }

                office.My_Office_ID = office.Office_ID;
                delete office.Office_ID;
                // Generate tokens
                // generateTokenByPrivate_key(entityType, entity, period, tokenType = TokenType.ACCESS_TOKEN)
                const accessToken = await generateTokenByPrivate_key('Office', office, '4h');
                const refreshToken = await generateTokenByPrivate_key('Office', office, '14d', TokenType.REFRESH_TOKEN);

                // Decode tokens for expiry dates
                let decoded = jwt.decode(accessToken);

                const accessExpiry = new Date(decoded.exp * 1000);
                decoded = jwt.decode(refreshToken);
                const refreshExpiry = new Date(decoded.exp * 1000);
                // Update session
                const updatedOffice = await prisma.realEstateOffice.update({
                    where: { Office_ID: office.My_Office_ID },
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
                        Office_ID: true,
                        Commercial_Register: true,
                        Office_Name: true,
                        Office_Phone: true,
                        Office_Image: true,
                        Office_Banner_Image: true,
                        Latitude: true,
                        Longitude: true,
                        Status: true,
                        Fal_Licenses: true,
                        Notifications: true,
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

                    }
                });

                if (req.headers['x-mobile-app']) {
                    return res.status(201).send({
                        data: {
                            ...updatedOffice,
                            token: updatedOffice.Session.Token,
                            refresh_token: updatedOffice.Refresh_Token.Refresh_Token,
                        },
                        message: 'Login successful',
                    });
                }


                res.cookie("session", updatedOffice.Session.Token, {
                    httpOnly: false,
                    sameSite: "none",
                    secure: true,     // set to true in prod with https
                    maxAge: 1000 * 60 * 60 * 4,
                });

                res.cookie("refreshToken", updatedOffice.Refresh_Token.Refresh_Token, {
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
                    data: updatedOffice
                });


            } catch (error) {
                dbErrorHandler(res, error, 'login');
                console.error(error.message);
            }

        } catch (error) {

        }
    } else if (Entity_Type === "User") {
        // Find user by username
        const { Username, Email, User_Phone, Password } = req.body;
        let user;
        try {
            if (Username) {
                user = await prisma.user.findUnique({
                    where: { Username: Username },
                });
            } else if (User_Phone) {
                user = await prisma.user.findUnique({
                    where: { User_Phone: User_Phone },
                });
            } else if (Email) {
                user = await prisma.user.findUnique({
                    where: { Email: Email },
                });
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify password
            const validPassword = await argon2.verify(user.Password, Password);
            if (!validPassword) {
                return res.status(403).json({ message: 'Invalid password' });
            }

            // Generate tokens
            const accessToken = await generateTokenByPrivate_key('User', user, '4h');
            const refreshToken = await generateTokenByPrivate_key('User', user, '14d', TokenType.REFRESH_TOKEN);

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
                    City: true,
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
    } else {
        res.status(403).send({ 'message': 'Entity type not supported' });
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
                // // Gov_ID: true, // not required
                Region: true,
                City: true,
                Full_Name: true,
                User_Phone: true,
                Other1: true,
                // Employer_REO_ID: true, // not required
                Username: true,
                // Balance: true, // not required
                // // Fal_Licenses: true, // not required
                // RE_Offices: { // not required
                //     select: {
                //         Office_ID: true,
                //     },
                // },
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
            // Gov_ID, // not required
            Region,
            City,
            Full_Name,
            User_Phone,
            Other1,
            // Employer_REO_ID, // not required
            Username,
            // Balance, // not required
            // RE_Offices
        } = req.body;

        const selectedFields = {
            ...(Role && { Role: true }),
            ...(Email && { Email: true }),
            ...(Profile_Image && { Profile_Image: true }),
            // ...(// Gov_ID && { // Gov_ID: true }), // not required
            ...(Region && { Region: true }),
            ...(City && { City: true }),
            ...(Full_Name && { Full_Name: true }),
            ...(User_Phone && { User_Phone: true }),
            ...(Other1 && { Other1: true }),
            // ...(Employer_REO_ID && { Employer_REO_ID: true }), // not required
            ...(Username && { Username: true }),
            // ...(Balance && { Balance: true }), // not required
            // ...(RE_Offices && {
            //     RE_Offices: {
            //         select: {
            //             Office_ID: true,
            //         },
            //     },
            // }),
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
                // Gov_ID: true,
                Region: true,
                City: true,
                Full_Name: true,
                User_Phone: true,
                Other1: true,
                // Employer_REO_ID: true,
                // Balance: true,
                // Fal_Licenses: { select: { License_ID: true, Fal_License_Number: true } }, // not required
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


const passwordReset = (prisma) => async (req, res) => {
    try {
        const { Email, User_Phone } = req.body;


        if (Email) {
            try {

                if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(Email))) {
                    return res.status(400).send({ 'message': 'Invalid email format' });
                }
                const user = await prisma.user.findUnique({
                    where: { Email: Email },
                    select: {
                        User_ID: true,
                        Username: true,

                    },
                });

                if (!user) {
                    return res.status(404).send({ 'message': 'Email not found' });
                }
                else {
                    const resetToken = await generateTokenByPrivate_key('User', user, "1h", TokenType.RESET_PASSWORD_TOKEN);

                    await prisma.user.update({
                        where: { User_ID: user.User_ID },
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
                            Reset_Token: resetToken
                        },
                    });


                    const transporter = nodemailer.createTransport({
                        host: 'smtp.sendgrid.net',
                        port: 587,
                        secure: false, // Use TLS
                        auth: {
                            /*
                            Environment Variables: Never hardcode your API Key directly in your main script.Use a .env file to keep it secret:
    
                            SENDGRID_API_KEY = SG.xxxxxxxx....
                            */
                            user: 'apikey', // This is exactly the string 'apikey', NOT your email, to tell SendGrid's servers to use your API key.
                            pass: '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' // The long key you just generated
                        }
                    });
                    const resetUrl = `/reset-password?token=${resetToken}`;
                    const domain = 'http://localhost:51727'; // this is flutter page, how to extract token from url in flutter
                    const mailOptions = {
                        from: '"My App Support" <fe9alsh3ben@gmail.com>', // Must be your verified sender!
                        to: 'modeer95kabeer@gmail.com',
                        subject: 'Password Reset Request',
                        text: 'Click here to reset your password: ' + domain,
                        html: `<p>You requested a password reset.</p> <a href="${domain + resetUrl}">Click here to reset your password</a> <p>This link expires in 1 hour.</p>`,
                        replyTo: 'fe9alsh3ben@gmail.com' // As we discussed, keep this same for testing
                    };

                    // once the user click on the link a web page open with hidden passwor for confirmation and then request the user to enter the new password!, is it the best method? 

                    // 3. Send the mail
                    await transporter.sendMail(mailOptions);

                    return res.status(200).send({ 'message': 'Password reset link sent successfully to your email' });
                }
            } catch (error) {
                console.error('SendGrid Error:', error);
                dbErrorHandler(res, error, 'password reset');
            }

        } else if (User_Phone) {
            if (!(/^\+?[0-9]{7,15}$/.test(User_Phone))) {
                return res.status(400).send({ 'message': 'Invalid phone number format' });
            }
            const user = await prisma.user.findUnique({
                where: { User_Phone: User_Phone },
                select: {
                    User_ID: true,
                    Username: true,

                },
            });

            if (!user) {
                return res.status(404).send({ 'message': 'Phone number not found' });
            }
            else {

                const resetToken = await generateTokenByPrivate_key('User', user, "1h", TokenType.RESET_PASSWORD_TOKEN);

                await prisma.user.update({
                    where: { User_ID: user.User_ID },
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
                        Reset_Token: resetToken
                    },
                });

                //Send link to phone number

                return res.status(200).send({ 'message': 'Password reset link sent successfully to your phone number' });
            }
        } else {
            return res.status(404).send({ 'message': 'Email or Phone number is not valid' });
        }
    }
    catch (error) {
        console.error(error);
        dbErrorHandler(res, error, 'password reset');
    }

}

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
    passwordReset,
    logout
}