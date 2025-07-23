


    


const generate_READ = (prisma) => async (req, res, next) => {
    try {
        if (!(req.body.Initiator && req.body.AdLicense && req.body.RealEstate && req.body.AdContent
            && req.body.AdStartedAt && req.body.AdExpiry
        )) {
            res.status(400).send(`
                Initiator, AD License, Real Estate, AD Content, AD Started At, 
                AD Expiry
                are required!`);
            return;
        }

        const dataEntry = {
            Initiator: req.body.Initiator,
            AdLicense: req.body.AdLicense,
            RealEstate: req.body.RealEstate,
            AdContent: req.body.AdContent,
            AdStartedAt: req.body.AdStartedAt,
            AdExpiry: req.body.AdExpiry
        }

        const createdAD = await prisma.RealEStateAD.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate AD was successfully created!",
            "Unit content": createdAD
        });

    } catch (error) {
        
        if (error.code === 'P2002') {
            res.status(400).send('P2002 error!');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }
    }
}

const get_READ = (prisma) => async (req, res, next) => {

    try {
        
    } catch (error) {
        
    }
}

const edit_READ = (prisma) => async (req, res, next) => {
    
    try {
        
    } catch (error) {
        
    }
}

const delete_READ = (prisma) => async (req, res, next) => {
    
    try {
        
    } catch (error) {
        
    }
}


module.exports = { 
    generate_READ,
    get_READ, 
    edit_READ, 
    delete_READ,
}