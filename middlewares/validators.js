const { isEmpty } = require("validator");

const signUpValidator = (req, res, next) => {


    const body = req.body;

    if (body == undefined) {
        console.log(1)
        res.status(400).send('No details entered');
        return

    } else if (!(body.Username || body.Email || body.GovID || body.Address || body.FullName || body.UserPhone)) {
        console.log(2)
        res.status(400).send('Your details are not complete');
    } else {
        try {
            const { Username, Email, GovID, Address, FullName, UserPhone } = body;

            if (!validator.isAlphanumeric(Username)) {

                res.status(400).send('Username entry should be letters and numaric only!');
                return
            }

            if (!validator.isEmail(Email)) {

                res.status(400).send('enter valid email')
                return
            }

            if (!validator.isNumeric(GovID)) {

                res.status(400).send('GovID should be numaric entry')
                return
            }

            if (Address == undefined || isEmpty(Address) || Address == null) {

                res.status(400).send('Address should be entered')
                return
            }


            if (!validator.isAlpha(FullName)) {

                res.status(400).send('Name in english has an error')
                return
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
const requestVerifier = (req, res, next) => {

    const body = req.body;


    try {
        

        next()
    } catch (error) {
        res.status(400).send(error.message)
    }
 }



module.exports = { signUpValidator, requestVerifier }