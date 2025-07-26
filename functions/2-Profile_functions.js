const { jwt, argon2, PRIVATE_KEY, PUBLIC_KEY } = require('../libraries/authTools_lib');
const { TokenType } = require('./token_functions');
const { User_Type } = require("@prisma/client");
const {
    generateTokenByPrivate_key,
} = require('./token_functions');
 

const signup = (prisma) => async (req, res) => {

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
                Gov_ID: body.Gov_ID,
                Address: body.Address,
                Full_Name: body.Full_Name,
                User_Phone: body.User_Phone,

            }
        }).then(async (v) => {
            var accessToken = await generateTokenByPrivate_key(v, "4h");
            var refreshToken = await generateTokenByPrivate_key(v, "14d", TokenType.REFRESH_TOKEN);
            var decoded = jwt.decode(refreshToken);
            var expiryDate = new Date(decoded.exp * 1000);

            await prisma.refreshToken.create({
                data: {
                    Refresh_Token: refreshToken,
                    User: { connect: { User_ID: v.User_ID } },
                    Expires_At: expiryDate
                }
            }).then((v) => refreshToken = v.Refresh_Token);

            decoded = jwt.decode(accessToken)
            expiryDate = new Date(decoded.exp * 1000);
            await prisma.Session.create({
                data: {
                    User: { connect: { User_ID: v.User_ID } },
                    Token: accessToken,
                    Expires_At: expiryDate
                }
            }).then((v) => accessToken = v.Token);

            res.status(201).send({
                data: v,
                Access_Token: accessToken,
                Refresh_Token: refreshToken
            });
        })


    } catch (error) {
         if (error.code === 'P2002') {
            res.status(400).send('A this username already taken.');
        } else {
        res.status(500).send(error);
        }
         
    }




}


const login = (prisma) => async (req, res) => {
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

        const accessToken = await generateTokenByPrivate_key(user, '4h');
        const refreshToken = await generateTokenByPrivate_key(user, "14d", TokenType.REFRESH_TOKEN);

        var decoded = jwt.decode(accessToken);
         
        var expiryDate = new Date(decoded.exp * 1000);

        await prisma.User.update({
            where: { User_ID: user.User_ID },
            data: {
                Session: {
                    update: {
                        data: {
                            Token: accessToken,
                            Expires_At: expiryDate
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
                Refresh_Tokens: {
                    update: {
                        data: {
                            Refresh_Token: refreshToken,
                            Expires_At: expiryDate
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



const becomeOfficeStaff = (prisma, User_Type) => async (req, res) => {

    try {
        let newRole;
        let resultMessage = "your role is changed to ";
        
                await prisma.User.update({
                    where: { User_ID: req.body.User_ID },
                    data: {
                        Role: User_Type.REAL_ESTATE_OFFICE_STAFF
                    }
                }).then((v) => newRole = v.Role)
                    
                

        res.status(200).send(`${resultMessage} ${v.Role}`);
        
    } catch (error) {
        res.status(500).send(`error: ${error.message}`)
    }

}


const get_Profile = (prisma) => async (req, res) => {

    try {
        await prisma.User.findUnique({
            where: { User_ID: req.body.User_ID },
            select: {
                User_ID: true,
                Role: true,
                Email: true,
                Profile_Image: true,
                Gov_ID: true,
                Address: true,
                Full_Name: true,
                User_Phone: true,
                Other1: true,
                Employer_REO_ID: true,
                Username: true,
                Balance: true,
            }
        }).then((v) => {
            if (!v) res.status(404).send('profile not found.');
            res.status(200).send(v);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}



const edit_Profile = (prisma) => async (req, res) => {

    try {

        if(!(req.body.Email ||
            req.body.Profile_Image || 
            req.body.Address || 
            req.body.Fal_License || 
            req.body.Other1)){
                res.status(400).send('Nothing to change?!...')
                return;
            }
        
        const updateData = {};
        if (req.body.Email) updateData.Email = req.body.Email;
        if (req.body.Profile_Image) updateData.Profile_Image = req.body.Profile_Image;
        if (req.body.Address) updateData.Address = req.body.Address;
        if (req.body.Other1) updateData.Other1 = req.body.Other1;

        
        await prisma.user.update({
            where: {User_ID: req.body.User_ID},
            data: updateData
        }).then((v)=>{
             
            res.status(202).json({
            message: 'Data was updated',
            data: v
        });


        });

    } catch (error) {
        res.status(500).send(`error occured:- \n ${error.message}`)
    }
}
module.exports = {
    signup,
    login,
    becomeOfficeStaff,
    get_Profile,
    edit_Profile
}