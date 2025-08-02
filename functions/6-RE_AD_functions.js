

const { dbErrorHandler } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});
 



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
            Initiator: { connect: { Office_ID: parseInt(req.body.Office_ID) } },
            RealEstate: { connect: { Unit_ID: parseInt(req.body.Unit_ID) } },
            AD_Type: req.body.AD_Type,
            AD_Unit_Type: req.body.AD_Unit_Type,
            AD_Content: req.body.AD_Content,
            AD_Started_At: new Date(Date.now),
            AD_Expiry: new Date("2026-12-31"),
            Hedden: false


        }

        const createdAD = await prisma.RealEStateAD.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate AD was successfully created!",
            "Unit content": createdAD
        });

    } catch (error) {

        dbErrorHandler(res, error, 'generate real estate ad');
        console.log(error.message);
    }
}

const get_READ = (prisma) => async (req, res) => {

    try {

        switch (req.body.searchType) {

            case SearchType.SEARCH_ONE:
                await prisma.realEStateAD.findUnique({
                    where: { AD_ID: parseInt(req.body.AD_ID) }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate AD not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_MANY:
                await prisma.realEStateAD.findMany({
                    where: {
                        RealEstate: {
                            connect: { Address: { City: req.body.city } }
                        }
                    }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate ADs not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:
                await prisma.realEStateAD.findMany({
                    where: {
                        AND: [
                            {
                                RealEstate: {
                                    Address: {
                                        path: ['Altitude'], // Ensure this matches your JSON key
                                        gt: req.body.coordinates.minAltitude,
                                        lt: req.body.coordinates.maxAltitude,
                                    },
                                },
                            },
                            {
                                RealEstate: {
                                    Address: {
                                        path: ['Longitude'], // Ensure this matches your JSON key
                                        gt: req.body.coordinates.minLongitude,
                                        lt: req.body.coordinates.maxLongitude,
                                    },
                                },
                            },
                        ],
                    },
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate ADs not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEStateAD.findMany({
                    where: { RealEstate: { Address: { Direction: req.coordinates.direction } } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate ADs not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            default:
                res.status(400).send('Invalid search type.');
        }

    } catch (error) {
        dbErrorHandler(res, error, 'get real estate ad');
    }
}

const edit_READ = (prisma) => async (req, res) => {

    try {

        if (!(
            req.body.AD_Type ||
            req.body.Outdoor_Unit_Images ||
            req.body.Unit_Type ||
            req.body.Specifications
        )) {
            res.status(400).send('Nothing to change?!...')
            return;
        }

        const updateData = {};
        if (req.body.Deed_Owners) updateData.Deed_Owners = req.body.Deed_Owners;
        if (req.body.Outdoor_Unit_Images) updateData.Outdoor_Unit_Images = req.body.Outdoor_Unit_Images;
        if (req.body.Unit_Type) updateData.Unit_Type = req.body.Unit_Type;
        if (req.body.Specifications) updateData.Specifications = req.body.Specifications;

        await prisma.realEstateUnit.update({
            where: { REU_ID: req.body.REU_ID },
            data: updateData
        }).then((v) => {
            res.status(202).json({
                message: 'Data was updated',
                data: v
            });
        });

    } catch (error) {
        dbErrorHandler(res, error, 'edit real estate ad');
    }
}

const delete_READ = (prisma) => async (req, res) => {

    try {

    } catch (error) {
        dbErrorHandler(res, error, 'delete real estate ad');
    }
}


module.exports = {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
}