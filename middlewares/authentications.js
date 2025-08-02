const { prisma } = require("../libraries/prisma_utilities");
const { dbErrorHandler } = require("../libraries/utilities");



async function officeAuthentication(req, res, next) {


    try {
        if (req.query) { Object.assign(req.body, req.query); }
        if (!req.body.Office_ID) return res.status(400).send('Office_ID is required.');
        prisma.realEstateOffice.findUnique({
            where: {
                Office_ID: parseInt(req.body.Office_ID),
            }
        }).then((v) => {
            if (!v) return res.status(404).send('Real Estate Office not found.');
            if (v.Owner_ID !== req.body.User_ID) return res.status(404).send('You are not the owner of this office.');
            req.body.Office_ID = v.Office_ID;
            next();
        })

    } catch (error) {
        dbErrorHandler(res, error, `office authentication`);
        console.log(error.message);
    }
}

async function markitingFalLicenseAuthentication(req, res, next) {
    try {
        console.log('authenticating fal license...');
        prisma.falLicense.findMany({
            where: {
                Office_ID: parseInt(req.body.Office_ID),
            }
        }).then((Licenses) => {
            if (!Licenses) return res.status(404).send('Fal License not found.');
            let marketingLicense;
            for(var License in Licenses){
                if(License.License_Type === "MARKETING") {
                    marketingLicense = License;
                    break;
                } 
            }
            if (Date.now() > Licenses.Expiry_Date) return res.status(404).send('Fal License expired.');
            if (Licenses.Office_ID !== req.body.Office_ID) return res.status(404).send('You are not the owner of this License.');
            req.License_Number = Licenses.License_Number;
             next();
        })

    } catch (error) {
        dbErrorHandler(res, error, `fal license authentication`);
        console.log(error.message);
    }
}

async function REUAuthentication(req, res, next) {
    console.log('authenticating REU...');
    try {
        if (!req.body.Unit_ID) return res.status(400).send('Unit ID is required.');

        prisma.realEstateUnit.findUnique({
            where: {
                Unit_ID: parseInt(req.body.Unit_ID)
            }
        }).then((v) => {
            if (!v) return res.status(404).send('Real Estate Unit not found.');
            if (v.Affiliated_Office_ID !== req.body.Office_ID) return res.status(404).send('Unit does not belong to your office.');
            req.body.Unit_ID = v.Unit_ID;
            next();
        })
    } catch (error) {
        dbErrorHandler(res, error, `REU authentication`);
        console.log(error.message);
    }
}

module.exports = {
    officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication
}
