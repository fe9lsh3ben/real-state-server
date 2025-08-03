const { prisma } = require("../libraries/prisma_utilities");
const { dbErrorHandler } = require("../libraries/utilities");



async function officeAuthentication(req, res, next) {
    try {
        if (req.query) {
            Object.assign(req.body, req.query);
        }

        if (!req.body.Office_ID)
            return res.status(400).send('Office_ID is required.');

        const office = await prisma.realEstateOffice.findUnique({
            where: {
                Office_ID: parseInt(req.body.Office_ID),
            }
        });

        if (!office)
            return res.status(404).send('Real Estate Office not found.');

        if (office.Owner_ID !== req.body.User_ID)
            return res.status(403).send('You are not the owner of this office.');

        req.body.Office_ID = office.Office_ID;
        next();

    } catch (error) {
        dbErrorHandler(res, error, 'office authentication');
        console.error(error.message);
    }
}


async function markitingFalLicenseAuthentication(req, res, next) {
    try {
        
        const Licenses = await prisma.falLicense.findMany({
            where: {
                Office_ID: parseInt(req.body.Office_ID),
            }
        });

        if (Licenses.length === 0)
            return res.status(404).send('Fal License not found.');

        let marketingLicense;
        for (const license of Licenses) {
            if (license.License_Type === "MARKETING") {
                marketingLicense = license;
                break;
            }
        }

        if (!marketingLicense)
            return res.status(404).send('Marketing license not found.');

        if (Date.now() > new Date(marketingLicense.Expiry_Date).getTime())
            return res.status(404).send('Fal License expired.');

        if (marketingLicense.Office_ID !== parseInt(req.body.Office_ID))
            return res.status(404).send('You are not the owner of this License.');

        req.body.License_Number = marketingLicense.License_Number;
        req.body.Expiry_Date = marketingLicense.Expiry_Date;
        next();
        
    } catch (error) {
        console.error('Fal license auth error:', error);
        dbErrorHandler(res, error, 'fal license authentication');
    }
}


async function REUAuthentication(req, res, next) {
 
    try {
        if (!req.body.Unit_ID) {
            return res.status(400).send('Unit ID is required.');
        }

        const unit = await prisma.realEstateUnit.findUnique({
            where: {
                Unit_ID: parseInt(req.body.Unit_ID)
            }
        });

        if (!unit) {
            return res.status(404).send('Real Estate Unit not found.');
        }

        if (unit.Affiliated_Office_ID !== req.body.Office_ID) {
            return res.status(403).send('Unit does not belong to your office.');
        }

        req.body.Unit_ID = unit.Unit_ID;
        next();

    } catch (error) {
        console.error('REU auth error:', error);
        dbErrorHandler(res, error, 'REU authentication');
    }
}


module.exports = {
    officeAuthentication,
    markitingFalLicenseAuthentication,
    REUAuthentication
}
