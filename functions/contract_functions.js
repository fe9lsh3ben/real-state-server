

const generateContractFunction = (prisma) => async (req, res) => {

    try {
        if (!(req.body.OfficeID && req.body.PartiesConsent
            && req.body.Contant
        )) {
            res.status(400).send(`
                Office ID, Parties Consent, Contant 
                are required!`);
            return;
        }

        const dataEntry = {
            Office_ID: req.body.Office_ID, 
            PartiesConsent: req.body.PartiesConsent,
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
        
        if (error.code === 'P2002') {
            res.status(400).send('P2002 error!');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }
    }


}



module.exports = { generateContractFunction }