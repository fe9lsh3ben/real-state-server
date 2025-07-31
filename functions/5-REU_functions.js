
const { dbErrorHandler } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});



const generate_REU = (prisma) => async (req, res) => {

    try {
        if (!(req.body.UnitType && req.body.DeedNumber && req.body.DeedDate && req.body.DeedOwners
            && req.body.AffiliatedOffice && req.body.Initiator && req.body.Address && req.body.UnitImages
            && req.body.Polygon && req.body.Specifications
        )) {
            res.status(400).send(`
                UnitType,DeedNumber,DeedDate,DeedOwners,AffiliatedOffice, 
                Initiator,Address,UnitImages,Polygon,Specifications 
                are required!`);
            return;
        }
        let polygon;
        if (req.body.Polygon) {
            polygon = await prisma.realEstateUnit.create_WKT_Polygon(req.body.Polygon)
        }
        const dataEntry = {
            UnitType: req.body.UnitType,
            DeedNumber: req.body.DeedNumber,
            DeedDate: req.body.DeedDate,
            DeedOwners: req.body.DeedOwners,
            AffiliatedOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } },
            Initiator: req.body.Initiator,
            Address: req.body.Address,
            Polygon: polygon,
            Specifications: req.body.Specifications,
            UnitImages: Buffer.from(req.body.UnitImages, 'base64')
        };


        const createdREUnit = await prisma.realEstateUnit.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate Unit was successfully created!",
            "Unit content": createdREUnit
        });
    } catch (error) {

        dbErrorHandler(res, error, 'generate real estate unit');

    }


}

const get_REU = (prisma) => async (req, res) => {

    try {

        switch (req.body.searchType) {

            case SearchType.SEARCH_ONE:
                await prisma.realEstateUnit.findUnique({
                    where: { REU_ID: parseInt(req.body.REU_ID) }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate unit not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_MANY:
                await prisma.realEstateUnit.findMany({
                    where: { Address: { city: req.body.city } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate units not found.');
                    res.status(200).send(v);
                    return;
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:
                await prisma.realEstateUnit.findMany({
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
                    if (!v) res.status(404).send('Real Estate units not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEstateunit.findMany({
                    where: { Address: { Direction: req.body.direction } }
                }).then((v) => {
                    if (!v) res.status(404).send('Real Estate units not found.');
                    res.status(200).send(v);
                    return;
                })
                break;

            default:
                res.status(400).send('Invalid search type.');
        }

    } catch (error) {
        dbErrorHandler(res, error, 'get real estate unit');
    }
}

const update_REU = (prisma) => async (req, res) => {

    try {

        if (!(
            req.body.Deed_Owners ||
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
        dbErrorHandler(res, error, 'update real estate unit');
    }
}

const delete_REU = (prisma) => async (req, res) => {

    try {
        if (!(req.body.REU_ID)) {
            res.status(400).send("estate unit ID is required!");
            return;
        }
        if (req.body.REU_ID) {
            await prisma.realEstateUnit.delete({
                where: {
                    REU_ID: req.body.REU_ID,
                }
            }).then((v) => {
                if (!v) res.status(404).send('unit not found.');
                res.status(200).send(' unit was deleted seccessfully!');
                return;
            })
        }


    } catch (error) {
        dbErrorHandler(res, error, 'delete real estate unit');
    }
}


module.exports = {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
}