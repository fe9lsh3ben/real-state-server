

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});

const generate_REO = (prisma, Office_Or_User_Status) => async (req, res) => {
    try {
        if (!(req.body.Commercial_Register && req.body.Office_Phone && req.body.User_ID && req.body.Address && req.body.Office_Name)) {
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

        if (req.body.Office_Image) {
            dataEntry.Office_Image = Buffer.from(req.body.Office_Image, 'base64'); // Convert to Bytes
        }

        const createdOffice = await prisma.realEstateOffice.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate Office was successfully created!",
            "office content": createdOffice
        });
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).send('A Real Estate Office with this Owner already exists.');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }
    }
};

const get_REO = (prisma) => async (req, res) => {

    try {

        switch (req.body.searchType) {

            case SearchType.SEARCH_ONE:
                await prisma.realEstateOffice.findUnique({
                    where: { Office_ID: parseInt(req.body.Office_ID) }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Office not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_MANY:
                await prisma.realEstateOffice.findMany({
                    where: { Address: { city: req.body.city } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:
                await prisma.realEstateOffice.findMany({
                    where: {
                        AND: [
                            {
                                Address: {
                                    path: ['Altitude'],
                                    gte: req.body.coordinates.minAltitude,
                                    lte: req.body.coordinates.maxAltitude,
                                },
                            },
                            {
                                Address: {
                                    path: ['Longitude'],
                                    gte: req.body.coordinates.minLongitude,
                                    lte: req.body.coordinates.maxLongitude,
                                },
                            },
                        ],
                    },
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEstateOffice.findMany({
                    where: { Address: { Direction: req.body.direction } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            default:
                res.status(400).send('Invalid search type.');
        }

    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
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
        if (req.body.Fal_License) updateData.Fal_License = {
            create: {
                Fal_License_Number: req.body.Fal_License.Fal_License_Number,
                Expiry_Date: req.body.Fal_License.Expiry_Date,
            }
        };

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
        res.status(500).send(`error occured:- \n ${error.message}`)
    }
};


module.exports = { generate_REO, get_REO, update_REO }