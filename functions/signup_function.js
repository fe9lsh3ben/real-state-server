const {jwt, argon2, PRIVATE_KEY, PUBLIC_KEY} = require('../libraries/authTools_lib');
const {
    generateTokenByPrivate_key, 
    } = require('./token_functions');

    
const signupFunction = (prisma) => async (req, res) => {

    const {
        role,
        termsCondetionID,
        username,
        email,
        password,
        govID,
        address,
        fullName,
        userPhone,
        other1,
        employerREOID,
        falLicense,
        balance,
        userStatus,
    } = req.body;

    try {


      

        const hashedPass = await argon2.hash(req.body.Password);
        req.body.Password = hashedPass;


        const body = req.body
        
        await prisma.user.create({ 
            data: {
                TermsCondetion: {connect: {ID: body.TermsCondetion,}},
                Username: body.Username,
                Email: body.Email,
                Password: body.Password,
                GovID: body.GovID,
                Address: body.Address,
                FullName: body.FullName,
                UserPhone: body.UserPhone,
                
        } }).then((v) => {
            var accessToken = generateTokenByPrivate_key(v,"1h");
            var refreshToken = generateTokenByPrivate_key(v,"14d");
            var decoded = jwt.decode(refreshToken);
            var expiryDate = new Date(decoded.exp * 1000);
            console.log(decoded);

            prisma.refreshToken.create({
                data: {
                    RefreshToken: refreshToken,
                    User: {connect: {ID: v.ID}},
                    ExpiresAt: expiryDate
                }
            }).then((v) => refreshToken = v.RefreshToken);
 
            decoded = jwt.decode(accessToken)
            expiryDate = new Date(decoded.exp * 1000);
            prisma.Session.create({
                data: {
                    User : {connect: {ID: v.ID}},
                    Token : accessToken,
                    ExpiresAt: expiryDate
                }
            }).then((v) => accessToken = v.Token);

            
            res.status(200).send({
                data: v,
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        })
        
    
    } catch (error) {
        res.status(400).send(error);
        throw Error(error.message)
    }




}

module.exports = {
    signupFunction
}