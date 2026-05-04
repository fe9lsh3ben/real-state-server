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



    try {
        
        const {
            //  User_Phone,
            Password,
            // Email,
            // Username,
            // Full_Name,
        } = req.body;




        var validatedPassword = validatePassword(Password);
            
        if (!validatedPassword.isValidLength) {
            res.status(400).send({ 'message': 'Password should be at least 8 characters long!' });
            return
        }

        // if (!validatedPassword.hasUpperCaseAndLowerCase) {
        //     res.status(400).send({ 'message': 'Password should contain both uppercase and lowercase letters!' });
        //     return
        // }


        // if (!validator.isEmail(Email)) {

        //     res.status(400).send({ 'message': 'enter valid email' })
        //     return
        // }

        // if (!validator.isNumeric(Gov_ID)) {

        //     res.status(400).send({ 'message': 'GovID should be numaric entry' })
        //     return
        // }

        console.log('next')

        next();

    } catch (e) {
        console.log(e)
        return res.status(400).send({ 'message': 'validator error' });
        // Rcord Error
    }



}

// function signupValidator(prisma) {

//     return async (req, res, next) => {

//         const { Username, Email, Gov_ID, User_Phone } = req.body;


//         try {

//             const matchedUser = await prisma.user.findFirst({
//                 where: {
//                     OR: [
//                         { Username: Username },
//                         { Email: Email },
//                         { Gov_ID: Gov_ID },
//                         { User_Phone: User_Phone }
//                     ]
//                 },
//                 select: {
//                     Username: true,
//                     Email: true,
//                     Gov_ID: true,
//                     User_Phone: true
//                 }
//             });

//             if (matchedUser) {
//                 if (matchedUser.Username == Username) {
//                     res.status(400).send({ 'message': 'Username is already taken' });
//                     return;
//                 } else if (matchedUser.Email == Email) {
//                     res.status(400).send({ 'message': 'Email is already taken' });
//                     return;
//                 } else if (matchedUser.Gov_ID == Gov_ID) {
//                     res.status(400).send({ 'message': 'Goverment ID is already taken' });
//                     return;
//                 } else if (matchedUser.User_Phone == User_Phone) {
//                     res.status(400).send({ 'message': 'User phone is already taken' });
//                     return;
//                 }

//             }


//             next()
//         } catch (error) {
//             res.status(400).send(error.message)
//         }
//     }
// }



module.exports = { 
    // signupValidator,
     signupVerifier }