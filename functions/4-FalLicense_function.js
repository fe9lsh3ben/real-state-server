const { dbErrorHandler } = require("../libraries/utilities");
const Fal_Type = Object.freeze({
    BROKERING: 'BROKERING',
    MARKETING: 'MARKETING',
    PROPERTY_MANAGEMENT: 'PROPERTY_MANAGEMENT',
    FACILITY_MANAGEMENT: 'FACILITY_MANAGEMENT',
    AUCTION_MANAGEMENT: 'AUCTION_MANAGEMENT',
    CONSULTING: 'CONSULTING',
    REAL_ESTATE_ADVERTISING: 'REAL_ESTATE_ADVERTISING',
});


const generate_FalLicense = (prisma) => async (req, res) => {
    let createdLicense;
    try {
        const {
            Fal_License_Number,
            License_Type,
            User_ID,
            Issue_Date,
            Expiry_Date,
        } = req.body;

        // Validate required fields
        if (!Fal_License_Number || !License_Type || !Issue_Date || !Expiry_Date) {
            return res.status(400).send(
                "License Number, License Type, Issue Date, Expiry Date  are required."
            );
        }
        if (!Fal_Type.hasOwnProperty(License_Type)) {
            return res.status(400).send(
                "License Type must be one of the following: BROKERING, MARKETING, PROPERTY MANAGEMENT, FACILITY MANAGEMENT, AUCTION MANAGEMENT, CONSULTING, REAL ESTATE ADVERTISING"
            );
        }
        var license = await prisma.falLicense.findUnique({ where: { Fal_License_Number } });
        if (license) {
            return res.status(400).send({ 'message': "This license already exists." });
        }
        createdLicense = await prisma.falLicense.create({
            data: {
                Fal_License_Number,
                License_Type,
                Owner_ID: User_ID,
                Issue_Date: new Date(Issue_Date),
                Expiry_Date: new Date(Expiry_Date),
                Offices: {
                    connect: {
                        Office_ID: req.body.Office_ID
                    }
                }
            }
        });

        return res.status(201).send({
            message: "Fal License was successfully created.",
            license: createdLicense
        });

    } catch (error) {
        if (typeof createdLicense !== "undefined" && createdLicense?.License_ID) {
            await prisma.falLicense.delete({ where: { License_ID: createdLicense.License_ID } });
            console.log('Error occurred and license was deleted!');
        }

        dbErrorHandler(res, error, "Generate fal license");
        console.error(error.code, error.message);
    }
};

const get_FalLicense = (prisma) => async (req, res) => {
    try {
        const { Fal_License_Number, Office_ID } = req.body;

        if (!Fal_License_Number && !Office_ID) {
            return res.status(400).send({ 'message': "License Number or Office ID is required." });
        }

        let license;

        if (Fal_License_Number) {
            license = await prisma.falLicense.findUnique({
                where: { Fal_License_Number }
            });
        } else if (Office_ID) {
            let licenses = await prisma.realEstateOffice.findMany({
                where: { Office_ID: parseInt(Office_ID) },
                select: { FalLicense: true }
            });

            if (licenses.length === 0) {
                return res.status(404).send({ 'message': 'No Fal License found for this office.' });
            }
            license = licenses;
        }

        if (!license) {
            return res.status(404).send({ 'message': 'Fal License not found.' });
        }

        return res.status(200).send(license);

    } catch (error) {
        dbErrorHandler(res, error, 'get fal license');
        console.error(error.message);
    }
};


const delete_FalLicense = (prisma) => async (req, res) => {
    try {
        const { Fal_License_Number } = req.body;

        if (!Fal_License_Number) {
            return res.status(400).send({ 'message': "License_Number or Office_ID is required!" });
        }


        const deleted = await prisma.falLicense.delete({
            where: { Fal_License_Number },
        });

        if (!deleted) {
            return res.status(404).send({ 'message': "Fal License not found." });
        }

        return res.status(200).json({
            message: "Fal License was successfully deleted!",
            deleted_license: deleted
        });

    } catch (error) {
        dbErrorHandler(res, error, "delete fal license");
        console.error(error.message);
    }
};



module.exports = {
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
}