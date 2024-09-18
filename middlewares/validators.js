const validator = require("validator");





const requestVerifier = (req, res, next) => {


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

            if (Address === undefined || Object.keys(Address) === 0 || Address === null) {
                
                res.status(400).send('Address should be entered')
                return
            }

            
            for (var e in FullName) {
                if (!validator.isAlpha(FullName[e])) {

                    res.status(400).send('Name error')
                    return
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
function signUpValidator (prisma) {
    
    return async (req, res, next) => {
        
        const { ID, Username, Email, GovID, Address, FullName, UserPhone } = req.body;


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



module.exports = {signUpValidator, requestVerifier}