
const { dbErrorHandler } = require("../libraries/utilities");

const generate_Contract = (prisma) => async (req, res) => {

    try {
        if (!(req.body.Office_ID && req.body.Parties_Consent
            && req.body.Contant
        )) {
            res.status(400).send(`
                Office ID, Parties Consent, Contant 
                are required!`);
            return;
        }

        const dataEntry = {
            Office_ID: req.body.Office_ID, 
            Parties_Consent: req.body.Parties_Consent,
            Contant: req.body.Contant
        }
        if(req.body.Other){
            dataEntry.Other = req.body.Other;
        }

        const createdContract = await prisma.Contract.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Contract was successfully created!",
            "Unit content": createdContract
        });
    } catch (error) {
        
        dbErrorHandler(res, error, 'generate contract');
    }


}

const get_Contract = (prisma) => async (req, res) => {
    
    try {
        
    } catch (error) {
        dbErrorHandler(res, error, 'get contract');
    }
}

const update_Contract = (prisma) => async (req, res) => {
    
    try {
        
    } catch (error) {
        dbErrorHandler(res, error, 'update contract');
    }
}

const delete_Contract = (prisma) => async (req, res) => {
    
    try {
        
    } catch (error) {
        dbErrorHandler(res, error, 'delete contract');
    }
}
     

module.exports = {
    generate_Contract, 
    get_Contract, 
    update_Contract, 
    delete_Contract 
}