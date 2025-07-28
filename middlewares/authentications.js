const { prisma } = require("../libraries/prisma_utilities");



async function officeAuthentication(req, res, next) {

    try {
        console.log('authenticating office...');
        if (!req.query.Office_ID) return res.status(400).send('Office_ID is required.');
        prisma.realEstateOffice.findUnique({
            where: {
                Office_ID: parseInt(req.query.Office_ID),
            }
        }).then((v) => {
            if (!v) return res.status(404).send('Real Estate Office not found.');
            if(v.Owner_ID !== req.body.User_ID) return res.status(404).send('You are not the owner of this office.');
            req.body.Office_ID = v.Office_ID;
            next();
        })
        
    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
    }
}

async function falLicenseAuthentication(req, res, next) {
     try {
        console.log('authenticating fal license...');
        prisma.falLicense.findUnique({
            where: {
                RealEstateOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } },
            }
        }).then((v) => {
            if (!v) return res.status(404).send('Fal License not found.');
            if (Date.now() > v.Expiry_Date) return res.status(404).send('Fal License expired.');
            if (v.RealEstateOfficeID !== req.body.Office_ID) return res.status(404).send('You are not the owner of this License.');
            req.Fal_License_Number = v.Fal_License_Number;
            next();
        })
        
    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
    }
}

async function REUAuthentication(req, res, next) {
    console.log('authenticating REU...');
    try {
        if(!req.query.REU_ID) return res.status(400).send('REU_ID is required.');

        prisma.realEstateUnit.findUnique({
            where:{
                REU_ID: parseInt(req.query.REU_ID)
            }
        }).then((v) => {
            if (!v) return res.status(404).send('Real Estate Unit not found.');
            if(v.Affiliated_Office_ID !== req.body.Office_ID) return res.status(404).send('Unit does not belong to your office.');
            req.body.REU_ID = v.REU_ID;
            next();
        })
    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
    }
}

module.exports = {
    officeAuthentication,
    falLicenseAuthentication,
    REUAuthentication
}
