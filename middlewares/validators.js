const validator = require("validator");


function validatePassword(password) {
    // Check if password is at least 8 characters long
    const isValidLength = validator.isLength(password, { min: 8 });

    // Check if it contains both uppercase and lowercase letters
    const hasUpperCaseAndLowerCase = validator.matches(password, /^(?=.*[a-z])(?=.*[A-Z])/);

    return { isValidLength, hasUpperCaseAndLowerCase };
}

// signup verifier example : {"Username": "fe9lsh3ben", "Password":"10890Fsh", "Email":"fe9olsh3ben@gmail.com", "GovID":"1089036089", "Address":"Makkah-Makkah-Shuqeyah", "FullName":"Faisal Mohammed", "UserPhone": "0546737456"}
const signupVerifier = (req, res, next) => {

    
    const body = req.body;
   
    if (body == undefined) {
        
        // console.log(1)
        res.status(400).send('No details entered');
        return

    } else if (!(body.Username || body.Password || body.Email || body.Gov_ID || body.Address || body.Full_Name || body.User_Phone)) {
        // console.log('d')
        // console.log(2)
        res.status(400).send('Your details are not complete');
    } else {
        try {

            const { Username, Password, Email,   Gov_ID, Address,  Full_Name,  User_Phone } = body;


            if (!validator.isAlphanumeric(Username)) {

                res.status(400).send('Username entry should be letters and numaric only!');
                return
            }

            var validatedPassword = validatePassword(Password);
            
            if(!validatedPassword.isValidLength){
                res.status(400).send('Password should be at least 8 characters long!');
                re
                turn
            }
            
            if(!validatedPassword.hasUpperCaseAndLowerCase){
                res.status(400).send('Password should contain both uppercase and lowercase letters!');
                return
            }

            // if (validatedPassword) {
            //     if (validatePassword.isValidLength) {
            //         res.status(400).send('Unvalid password lingth!');
            //         return
            //     }

            //     if (validatePassword.hasUpperCaseAndLowerCase) {
            //         res.status(400).send('Unvalid password upper and lowercase!');
            //         return
            //     }
            // }

            if (!validator.isEmail(Email)) {

                res.status(400).send('enter valid email')
                return
            }

            if (!validator.isNumeric(Gov_ID)) {

                res.status(400).send('GovID should be numaric entry')
                return
            }

            if (Address === undefined || Object.keys(Address) === 0 || Address === null) {

                res.status(400).send('Address should be entered')
                return
            }


            for (var namePart of Full_Name) {
                if (!validator.isAlpha(namePart)) {
                    res.status(400).send('name should be letters only!');
                    return;
                }
            }



            if (!validator.isNumeric(User_Phone)) {

                res.status(400).send('User Phone should be numaric entry')
                return
            }

            // if (!validator.isDate(birthOfDate)) {

            //     res.status(400).send('insert valid date format')
            //     return

            // } else if (18 > (DateDiff.inDays(new Date(birthOfDate), new Date())) / 365) {

            //     res.status(400).send('Your age should be above 18!')
            //     return
            // }


            
            next();

        } catch (e) {
            // Rcord Error
        }

    }

}

function signupValidator(prisma) {
    
    return async (req, res, next) => {

        const { Username, Email, Gov_ID, User_Phone } = req.body;


        try {

            const matchedUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { Username: Username },
                        { Email: Email },
                        { Gov_ID: Gov_ID },
                        { User_Phone: User_Phone }
                    ]
                },
                select: {
                    Username: true,
                    Email: true,
                    Gov_ID: true,
                    User_Phone: true
                }
            });
            
            if (matchedUser) {
                if (matchedUser.Username == Username) {
                    res.status(400).send('Username is already taken');
                    return;
                } else if (matchedUser.Email == Email) {
                    res.status(400).send('Email is already taken');
                    return;
                } else if (matchedUser.Gov_ID == Gov_ID) {
                    res.status(400).send('GovID is already taken');
                    return;
                } else if (matchedUser.User_Phone == User_Phone) {
                    res.status(400).send('UserPhone is already taken');
                    return;
                }
            }

            
            next()
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
}



module.exports = { signupValidator, signupVerifier }