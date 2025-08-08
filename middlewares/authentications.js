const { prisma } = require("../libraries/prisma_utilities");
const { dbErrorHandler } = require("../libraries/utilities");



async function officeAuthentication(req, res, next) {
    try {


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

        const office = await prisma.realEstateOffice.findFirst({
            where: {
                Office_ID: req.body.Office_ID,
                FalLicense: {
                    some: {
                        License_Type: "MARKETING"
                    }
                }
            },
            include: {
                FalLicense: true
            }
             
        });
         
        let License = office.FalLicense[0];
        if (!License) return res.status(404).send('No Marketing Fal License found.');
 
        if (Date.now() > new Date(License.Expiry_Date).getTime())
            return res.status(404).send('Marketing Fal License expired.');

        req.body.Fal_License_Number = License.Fal_License_Number;
        req.body.Expiry_Date = License.Expiry_Date;
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
