const {argon2} = require('../libraries/auth_lib')
const {generateTokenByPrivate_key} = require('./token_functions');



const loginFunction = (prisma) => async (req, res) => {


const { Username, Password } = req.body;

// Find the user in the database
const user = await prisma.User.findUnique({
    where: { Username: Username },
});

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}

// Validate the password
try {
    const validPassword = await argon2.verify(user.Password, Password);
    console.log(validPassword)
    if (!validPassword) {
        return res.status(403).json({ message: 'Invalid password' });
    }

    const token = generateTokenByPrivate_key(user,'3d');
    await prisma.User.update({
        where: { ID: user.ID },
        data:{
            Session:{
                update: {
                    data: {
                        Token: token
                    }
                }
            }
        }
    });

    res.status(200).send(token)
} catch (err) {
    console.log(err)
    res.status(400).send(err.message)
    throw new Error('Password verification failed');
}


}

module.exports = {
    loginFunction
}