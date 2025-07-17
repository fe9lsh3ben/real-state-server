const { jwt, argon2, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { User_Type } = require("@prisma/client");
const {
    generateTokenByPrivate_key,
} = require('./token_functions');
 const { prisma } = require('../libraries/prisma_utilities');


const signupFunction = (prisma) => async (req, res) => {

    try {

        const hashedPass = await argon2.hash(req.body.Password);
        req.body.Password = hashedPass;

        const body = req.body;

        await prisma.user.create({
            data: {
                TermsCondetion: { connect: { TC_ID: body.TC_ID, } },
                Username: body.Username,
                Email: body.Email,
                Password: body.Password,
                GovID: body.GovID,
                Address: body.Address,
                FullName: body.FullName,
                UserPhone: body.UserPhone,

            }
        }).then((v) => {
            var accessToken = generateTokenByPrivate_key(v, "4h");
            var refreshToken = generateTokenByPrivate_key(v, "14d");
            var decoded = jwt.decode(refreshToken);
            var expiryDate = new Date(decoded.exp * 1000);
            console.log(decoded);

            prisma.refreshToken.create({
                data: {
                    RefreshToken: refreshToken,
                    User: { connect: { User_ID: v.User_ID } },
                    ExpiresAt: expiryDate
                }
            }).then((v) => refreshToken = v.RefreshToken);

            decoded = jwt.decode(accessToken)
            expiryDate = new Date(decoded.exp * 1000);
            prisma.Session.create({
                data: {
                    User: { connect: { User_ID: v.User_ID } },
                    Token: accessToken,
                    ExpiresAt: expiryDate
                }
            }).then((v) => accessToken = v.Token);

            res.status(201).send({
                data: v,
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        })


    } catch (error) {
        res.status(500).send(error);
        throw Error(error.message)
    }




}



const loginFunction = (prisma) => async (req, res) => {
    try {
        const { Username, Password } = req.body;

        // Find the user in the database
        const user = await prisma.User.findUnique({
            where: { Username: Username },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate the password

        const validPassword = await argon2.verify(user.Password, Password);

        if (!validPassword) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        const accessToken = generateTokenByPrivate_key(user, '4h');
        const refreshToken = generateTokenByPrivate_key(user, '14d');

        var decoded = jwt.decode(accessToken);
        var expiryDate = new Date(decoded.exp * 1000);

        await prisma.User.update({
            where: { User_ID: user.User_ID },
            data: {
                Session: {
                    update: {
                        data: {
                            Token: accessToken,
                            ExpiresAt: expiryDate
                        }
                    }
                }
            }
        });


        decoded = jwt.decode(refreshToken);
        expiryDate = new Date(decoded.exp * 1000);

        await prisma.User.update({
            where: { User_ID: user.User_ID },
            data: {
                RefreshTokens: {
                    update: {
                        data: {
                            RefreshToken: refreshToken,
                            ExpiresAt: expiryDate
                        }
                    }
                }
            }
        });

        res.status(200).json({
            'Access Token': accessToken,
            'Refresh Token': refreshToken
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err.message)
        throw new Error('Password verification failed, resoan:-\n', err.message);
    }


}



const changeUserTypeFunction = (prisma, User_Type) => async (req, res) => {

    try {
        let newRole;
        let resultMessage = "your role is changed to ";
        switch (req.body.ChangeToRole) {

            case "BUSINESS_BENEFICIARY":

                await prisma.User.update({
                    where: { User_ID: req.body.User_ID },
                    data: {
                        Role: User_Type.BUSINESS_BENEFICIARY
                    }
                }).then((v) => newRole = v.Role)
                    
                break;

            case "REAL_ESTATE_OFFICE_OWNER":

                if (!req.body.FalLicense) { res.status(404).send("Fal License is required!"); return; }

                await prisma.User.update({
                    where: { User_ID: req.body.User_ID },
                    data: {
                        Role: User_Type.REAL_ESTATE_OFFICE_OWNER,
                        FalLicense: req.body.FalLicense
                    }
                }).then((v) => newRole = v.Role);

                break;

            case "REAL_ESTATE_OFFICE_STAFF":

                if (!req.body.FalLicense) { res.status(404).send("Fal License is required!"); return; }

                await prisma.User.update({
                    where: { User_ID: req.body.User_ID },
                    data: {
                        Role: User_Type.REAL_ESTATE_OFFICE_STAFF,
                        FalLicense: req.body.FalLicense
                    }
                }).then((v) => newRole = v.Role);

                break;

            case "OTHER":
                await prisma.User.update({
                    where: { User_ID: req.body.User_ID },
                    data: {
                        Role: User_Type.OTHER
                    }
                }).then((v) => newRole = v.Role);

                break;

            default:
                resultMessage = "Nothing change!";
                newRole = ''
                break;
        }

        res.status(200).send(`${resultMessage} ${v.Role}`);
        
    } catch (error) {
        res.status(500).send(`error: ${error.message}`)
    }

}


const getProfile = (prisma) => async (req, res) => {

    try {
        prisma.User.findUnique({
            where: { User_ID: req.body.profile.User_ID },
            select: {
                ProfileImage: true,
                Username: true,
                UserStatus: true
            }
        }).then((v) => {
            res.status(200).send(v);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}


const getProfiles = (prisma) => async (req, res) => {
    try {
        prisma.User.findMany({

        }).then((v) => {
            res.status(200).send(v);
        })
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const editProfile = (prisma) => async (req, res) => {

    try {

        if(!(req.body.Email ||
            req.body.ProfileImage || 
            req.body.Address || 
            req.body.FalLicense || 
            req.body.Other1)){
                res.status(400).send('Nothing to change?!...')
                return;
            }
        
        const updateData = {};
        if (req.body.Email) updateData.Email = req.body.Email;
        if (req.body.ProfileImage) updateData.ProfileImage = req.body.ProfileImage;
        if (req.body.Address) updateData.Address = req.body.Address;
        if (req.body.FalLicense) updateData.FalLicense = req.body.FalLicense;
        if (req.body.Other1) updateData.Other1 = req.body.Other1;

        prisma.User.Update({
            where: {User_ID: req.body.User_ID},
            data: {updateData}
        }).then((v)=>{

            res.status(202).send(`Data was updated:- \n ${v}`)
        });

    } catch (error) {
        res.status(500).send(`error occured:- \n ${error.message}`)
    }
}
module.exports = {
    signupFunction,
    loginFunction,
    changeUserTypeFunction,
    getProfile,
    getProfiles,
    editProfile
}