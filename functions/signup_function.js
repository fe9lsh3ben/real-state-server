const argon2 = require('argon2')


const signupFunction =  (prisma) => async (req, res) => {
    try {
        
        
        try {
            console.log(req.body.Password)
            req.body.password =  await argon2.hash(req.body.Password);
        } catch (err) {
            res.status(400).send(err);
            throw new Error('Password hashing failed');
        }

        await prisma.user.create({ data: req.body }).then((v) => res.status(200).send(v))
    } catch (error) {
        console.log(error.message)
    }




}

module.exports = {
    signupFunction
}