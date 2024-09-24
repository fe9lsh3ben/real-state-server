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
        console.log(1)
        res.status(400).send('No details entered');
        return

    } else if (!(body.Username || body.Password || body.Email || body.GovID || body.Address || body.FullName || body.UserPhone)) {
        console.log(2)
        res.status(400).send('Your details are not complete');
    } else {
        try {

            const { Username, Password, Email, GovID, Address, FullName, UserPhone } = body;


            if (!validator.isAlphanumeric(Username)) {

                res.status(400).send('Username entry should be letters and numaric only!');
                return
            }

            var validatedPassword = validatePassword(Password);
            console.log(validatedPassword)
            if (validatedPassword) {
                if (validatePassword.isValidLength) {
                    res.status(400).send('Unvalid password lingth!');
                    return
                }

                if (validatePassword.hasUpperCaseAndLowerCase) {
                    res.status(400).send('Unvalid password upper and lowercase!');
                    return
                }
            }

            if (!validator.isEmail(Email)) {

                res.status(400).send('enter valid email')
                return
            }

            if (!validator.isNumeric(GovID)) {

                res.status(400).send('GovID should be numaric entry')
                return
            }

            if (Address === undefined || Object.keys(Address) === 0 || Address === null) {

                res.status(400).send('Address should be entered')
                return
            }


            for (var namePart of FullName.split(' ')) {
                if (!validator.isAlpha(namePart)) {
                    console.log(namePart, 'ddd');
                    res.status(400).send('Name error');
                    return;
                }
            }



            if (!validator.isNumeric(UserPhone)) {

                res.status(400).send('UserPhone should be numaric entry')
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

        const { ID, Username, Password, Email, GovID, Address, FullName, UserPhone } = req.body;


        try {

            const matchedUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { Username: Username },
                        { Email: Email },
                        { GovID: GovID },
                        { UserPhone: UserPhone }
                    ]
                },
                select: {
                    Username: true,
                    Email: true,
                    GovID: true,
                    UserPhone: true
                }
            });

            if (matchedUser) {
                if (matchedUser.Username) {
                    res.status(400).send('Username is already taken');
                    return;
                } else if (matchedUser.Email) {
                    res.status(400).send('Email is already taken');
                    return;
                } else if (matchedUser.GovID) {
                    res.status(400).send('GovID is already taken');
                    return;
                } else if (matchedUser.UserPhone) {
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