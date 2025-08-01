
const { syncTokens } = require('./token_functions');
const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});

const { dbErrorHandler } = require('../libraries/utilities');

const generate_REO = (prisma, Office_Or_User_Status, User_Type) => async (req, res) => {
    try {

        if (!req.body.Commercial_Register && !req.body.Office_Phone && !req.body.User_ID && !req.body.Address && !req.body.Office_Name) {
            res.status(400).send("Commercial Register, Address, and Office Name are required!");
            return;
        }
        const dataEntry = {
            Commercial_Register: req.body.Commercial_Register,
            Owner: { connect: { User_ID: parseInt(req.body.User_ID) } },
            Office_Phone: req.body.Office_Phone,
            Office_Name: req.body.Office_Name,
            Address: req.body.Address,
            Status: Office_Or_User_Status.ACTIVE, // Assuming a default status
        };

        if (req.body.Fal_License_Number) dataEntry.Fal_License = { connect: { Fal_License_Number: req.body.Fal_License_Number } };

        if (req.body.Office_Image) {
            dataEntry.Office_Image = Buffer.from(req.body.Office_Image, 'base64'); // Convert to Bytes
        }

        const createdOffice = await prisma.realEstateOffice.create({
            data: dataEntry
        });

        const user = await prisma.user.update({
            where: { User_ID: req.body.User_ID },
            data: {
                Role: User_Type.REAL_ESTATE_OFFICE_OWNER,
            },
        });

        syncTokens(
            user,
            {
                message: "Real Estate Office was successfully created!",
                office_content: createdOffice,
                note: "Your role become Real Estate Office owner",
            },
            res);

    } catch (error) {
        dbErrorHandler(res, error, 'generate REO');
    }
};

const get_REO = (prisma) => async (req, res) => {
    try {
       
        switch (req.query.Search_Type) {

            case SearchType.SEARCH_ONE:
                await prisma.realEstateOffice.findUnique({
                    where: { Office_ID: parseInt(req.query.Office_ID) }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Office not found.');
                    return res.status(200).send(v);

                });
                break;

            case SearchType.SEARCH_MANY:

                await prisma.realEstateOffice.findMany({
                    where: {
                        Address: {
                            path: [req.query.Geo_level],
                            equals: req.query.City
                        }
                    }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Offices not found.');
                    return res.status(200).send(v);
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:

                await prisma.realEstateOffice.findMany({
                    where: {
                        AND: [
                            {
                                Address: {
                                    path: ['Altitude'],
                                    gte: req.query.coordinates.minAltitude,
                                    lte: req.query.coordinates.maxAltitude,
                                },
                            },
                            {
                                Address: {
                                    path: ['Longitude'],
                                    gte: req.query.coordinates.minLongitude,
                                    lte: req.query.coordinates.maxLongitude,
                                },
                            },
                        ],
                    },
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Offices not found.');
                    return res.status(200).send(v);
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEstateOffice.findMany({
                    where: {
                        Address: {
                            path: ['Direction'],
                            equals: req.query.Direction
                        }
                    }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Offices not found.');
                    return res.status(200).send(v);

                })
                break;

            default:
             
                return res.status(400).send('Invalid search type.');
        }

    } catch (error) {
        return dbErrorHandler(res, error, 'get REO');
    }
}

const update_REO = (prisma) => async (req, res) => {
    try {

        if (!(
            req.body.Office_Phone ||
            req.body.Office_Image ||
            req.body.Address
        )) {
            res.status(400).send('Nothing to change?!...')
            return;
        }

        const updateData = {};
        if (req.body.Office_Phone) updateData.Office_Phone = req.body.Office_Phone;
        if (req.body.Office_Image) updateData.Office_Image = req.body.Office_Image;
        if (req.body.Address) updateData.Address = req.body.Address;


        await prisma.realEstateOffice.update({
            where: { Office_ID: req.body.Office_ID },
            data: updateData
        }).then((v) => {

            res.status(202).json({
                message: 'Data was updated',
                data: v
            });


        });

    } catch (error) {
        dbErrorHandler(res, error, 'update REO');
    }
};


module.exports = { generate_REO, get_REO, update_REO }