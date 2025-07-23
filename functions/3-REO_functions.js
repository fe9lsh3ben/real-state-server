

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
                    res.status(200).json({ message: 'Real Estate Office was successfully found!', "office content": v });
                    return;
                });
                break;

            case SearchType.SEARCH_MANY:
                await prisma.realEstateOffice.findMany({
                    where: { Address: { city: req.body.city } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).json({ message: 'Real Estate Offices were successfully found!', "offices content": v });
                    return;
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:
                await prisma.realEstateOffice.findMany({
                    where: {
                        AND: [
                            {
                                Address: {
                                    path: ['altitude'],
                                    gt: minAltitude,
                                    lt: maxAltitude,
                                },
                            },
                            {
                                Address: {
                                    path: ['Longitude'],
                                    gt: minLongitude,
                                    lt: maxLongitude,
                                },
                            },
                        ],
                    },
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).json({ message: 'Real Estate Offices were successfully found!', "offices content": v });
                    return;
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEstateOffice.findMany({
                    where: { Address: { Direction: req.body.direction } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate Offices not found.');
                    res.status(200).json({ message: 'Real Estate Offices were successfully found!', "offices content": v });
                    return;
                })
                break;

            default:
                res.status(400).send('Invalid search type.');
        }
        var offices

        await prisma.realEstateOffice.findMany({
            where: { Address: { city: req.body.city } }
        }).then((v) => offices = v)
    } catch (error) {
        res.status(500).send(`Error occurred: ${error.message}`);
    }
}

const update_REO = (prisma) => async (req, res) => {
    try {
        if (!req.body.Office_ID) {
            res.status(400).send("Real Estate Office ID is required!");
            return;
        }

        if (!(req.body.Commercial_Register ||
            req.body.Office_Name ||
            req.body.Address ||
            req.body.Office_Image)) {
            res.status(400).send('no data sent to change!')
            return
        };

        const Office_ID = parseInt(req.body.Office_ID);
        const updateData = {};

        if (req.body.Commercial_Register) updateData.Commercial_Register = req.body.Commercial_Register;
        if (req.body.Office_Name) updateData.Office_Name = req.body.Office_Name;
        if (req.body.Address) updateData.Address = req.body.Address;
        if (req.body.Office_Image) updateData.Office_Image = Buffer.from(req.body.Office_Image, 'base64');

        const updatedOffice = await prisma.realEstateOffice.update({
            where: { Office_ID: Office_ID },
            data: updateData
        });

        res.status(200).json({
            message: "Real Estate Office was successfully updated!",
            "updated office content": updatedOffice
        });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Real Estate Office not found.');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }
    }
};


module.exports = { generate_REO, get_REO, update_REO }