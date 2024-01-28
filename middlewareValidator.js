var validator = require('validator');
const DateDiff = require('./dateDef')



const requestValidator = (req,res, next)=>{
    
    console.log (req.body.fullName.english[0])
    
    
    // console.log(v[1] + " " + validator.isAlpha(v))
    
    if (req.body == undefined) {
        console.log(req.body)
        res.status(400).send('Bad Request');
        return;
    }else { 
        try {
            const {username, fullName, age, govermentalID, birthOfDate, email} = req.body;
            
            if (!validator.isAlphanumeric(username)) {
                
                res.status(400).send('Username entry should be letters and numaric only!');
                return
            }

            if (!validator.isAlpha(fullName.english,'en-US')) {
                
                res.status(400).send('Name in english has no entry')
                return

            }
            
            if (!validator.isAlpha(fullName.arabic,'ar-SA')) {
            
                res.status(400).send('Name in arabic has no entry')
                return
            } 
            

            if (!validator.isNumeric(age)) {
            
                res.status(400).send('age should be numaric entry')
                return
            }
            
            if (!validator.isNumeric(govermentalID)) {

                res.status(400).send('govermentalID should be numaric entry')
                return
            } 
            
            if (!validator.isDate(birthOfDate)) {
            
                res.status(400).send('Name in english has no entry') 
                return
            }else if(18 >(DateDiff.inDays(new Date(birthOfDate), new Date()))/365){
                res.status(400).send('Your age should be above 18!') 
                return
            }

            if (!validator.isEmail(email)) {
                
                res.status(400).send('enter valid email') 
                return
            } 

            res.status(200).send('validation success')
            next();

        } catch (e) {
            // Rcord Error
        }
        
    }
}


module.exports = requestValidator