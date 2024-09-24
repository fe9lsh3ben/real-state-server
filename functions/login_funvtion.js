const {jwt, argon2} = require('../libraries/auth_lib')


const loginFunction = async (req,res) =>{


const { username, password } = req.body;

// Find the user in the database
const user = await prisma.user.findUnique({
    where: { username: username },
});

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}

// Validate the password
try {
    const validPassword = await argon2.verify(hashedPassword, password);
    console.log(validPassword)
    if (!validPassword) {
        return res.status(403).json({ message: 'Invalid password' });
    }
} catch (err) {
    throw new Error('Password verification failed');
}


// Generate JWT using RS256
// const accessToken = generateAccessToken(user);

// res.json({
//     accessToken,
//     message: 'Login successful',
// });

}

module.exports = {
    loginFunction
}