var validator = require('validator');
const DateDiff = require('./dateDef')



const requestValidator = (req, res, next)=>{
    
    
    const body = req.body;
    if (body == undefined) {
        console.log(1)
        res.status(400).send('No details entered');
        return

    }else if(!(body.username || body.fullName || body.age || body.govermentalID || body.birthOfDate || body.email)){
        console.log(2)
        res.status(400).send('Your details are not completed');
    }else { 
        try {
            const {username, fullName, age, govermentalID, birthOfDate, email} = body;
            
            if (!validator.isAlphanumeric(username)) {
                
                res.status(400).send('Username entry should be letters and numaric only!');
                return
            }
            
            for( v in fullName.english){
                if (!validator.isAlpha(fullName.english[v],'en-US')) {
                    
                    res.status(400).send('Name in english has an error')
                    return
                }

            }
            for( v in fullName.arabic){
                if (!validator.isAlpha(fullName.arabic[v],'ar-SA')) {
                    
                    res.status(400).send('Name in arabic has an error')
                    return
                }
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
                
                res.status(400).send('insert valid date format') 
                return
            
            }else if(18 >(DateDiff.inDays(new Date(birthOfDate), new Date()))/365){
                
                res.status(400).send('Your age should be above 18!') 
                return
            }

            if (!validator.isEmail(email)) {
                
                res.status(400).send('enter valid email') 
                return
            } 

            next();

        } catch (e) {
            // Rcord Error
        }
        
    }
}



const signupValidator = (req, res, next)=>{
    
}
module.exports = {requestValidator, signupValidator}