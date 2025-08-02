
const { parse } = require('dotenv');
const { dbErrorHandler } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
    SEARCH_BY_Unit: 'search_by_Unit',
});



const generate_REU = (prisma) => async (req, res) => {

    try {

        if (!(req.body.Unit_Type && req.body.RE_Name && req.body.Deed_Number && req.body.Deed_Date && req.body.Deed_Owners
            && req.body.Affiliated_Office && req.body.Initiator && req.body.Address && req.body.Outdoor_Unit_Images
            && req.body.Specifications
        )) {
            res.status(400).send(`
                Unit Type, Deed Number, Deed Date, Deed Owners, Affiliated Office, 
                Initiator,Address,Unit Images, Polygon, Specifications 
                are required!`);
            return;
        }



        const dataEntry = {
            Unit_Type: req.body.Unit_Type,
            RE_Name: req.body.RE_Name,
            Deed_Number: req.body.Deed_Number,
            Deed_Date: new Date(req.body.Deed_Date),
            Deed_Owners: req.body.Deed_Owners,
            Affiliated_Office: { connect: { Office_ID: parseInt(req.body.Office_ID) } },
            Initiator: req.body.Initiator,
            Address: req.body.Address,
            Specifications: req.body.Specifications,
            // Outdoor_Unit_Images: Buffer.from(req.body.Outdoor_Unit_Images, 'base64')
        };

        if (req.body.Polygon) {
            dataEntry.Polygon = await prisma.realEstateUnit.create_WKT_Polygon(req.body.Polygon)
        }

        const createdREUnit = await prisma.realEstateUnit.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate Unit was successfully created!",
            "Unit content": createdREUnit
        });
    } catch (error) {

        dbErrorHandler(res, error, 'generate real estate unit');
        console.log(error.message);
    }


}

const get_REU = (prisma) => async (req, res) => {
    try {

        switch (req.query.Search_Type) {

            case SearchType.SEARCH_ONE:
                await prisma.realEstateUnit.findUnique({
                    where: { Unit_ID: parseInt(req.query.Unit_ID) }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Unit not found.');
                    return res.status(200).send(v);

                });
                break;

            case SearchType.SEARCH_MANY:

                const geoLevel = req.query.Geo_level;
                const geoValue = req.query.Geo_value;

                if (!geoLevel && !geoValue) {
                    return res.status(400).send("Missing Geo_level or City query parameters.");
                }

                await prisma.realEstateUnit.findMany({
                    where: {
                        Address: {
                            path: [geoLevel],
                            equals: geoValue
                        }
                    }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Units not found.');
                    return res.status(200).send(v);
                });
                break;

            case SearchType.SEARCH_ON_SCREEN:

                await prisma.realEstateUnit.findMany({
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
                    if (!v) return res.status(404).send('Real Estate Units not found.');
                    return res.status(200).send(v);
                })
                break;

            case SearchType.SEARCH_DIRECTION:
                await prisma.realEstateUnit.findMany({
                    where: {
                        Address: {
                            path: ['Direction'],
                            equals: req.query.Direction
                        }
                    }
                }).then((v) => {
                    if (!v) return res.status(404).send('Real Estate Units not found.');
                    return res.status(200).send(v);

                })
                break;

            default:

                return res.status(400).send('Invalid search type.');
        }

    } catch (error) {
        dbErrorHandler(res, error, 'get REU');
        console.log(error.message);
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

        await prisma.realEstateUnit.findUnique({
            where: { Unit_ID: parseInt(req.body.Unit_ID) },
            select: { Initiator: true }
        }).then(async (v) => {
            if (!v) return res.status(404).send('Real Estate Unit not found.');
            v.Initiator.Edited_By.push(req.body.Edited_By);
            const updateData = {};
            if (req.body.Unit_Type) updateData.Unit_Type = req.body.Unit_Type;
            if (req.body.RE_Name) updateData.RE_Name = req.body.RE_Name;
            if (req.body.Deed_Owners) updateData.Deed_Owners = req.body.Deed_Owners;
            if (req.body.Affiliated_Office) updateData.Affiliated_Office = { connect: { Office_ID: parseInt(req.body.Office_ID) } };
            updateData.Initiator = {
                "Created_By": v.Initiator.Created_By,
                "Edited_By": v.Initiator.Edited_By //-> empty
            }
            if (req.body.Address) updateData.Address = req.body.Address;
            if (req.body.Specifications) updateData.Specifications = req.body.Specifications;
            if (req.body.Outdoor_Unit_Images) updateData.Outdoor_Unit_Images = req.body.Outdoor_Unit_Images;

            await prisma.realEstateUnit.update({
                where: { Unit_ID: parseInt(req.body.Unit_ID) },
                data: updateData
            }).then((v) => {
                res.status(202).json({
                    message: 'Data was updated',
                    data: v
                });
            });



        })
        return;


    } catch (error) {
        dbErrorHandler(res, error, 'update real estate unit');
        console.log(error.message);
    }
}

const delete_REU = (prisma) => async (req, res) => {

    try {
        if (req.query) { Object.assign(req.body, req.query); }
        if (!(req.body.Unit_ID)) {
            res.status(400).send("estate unit ID is required!");
            return;
        }
        if (req.body.Unit_ID) {
            await prisma.realEstateUnit.delete({
                where: {
                    Unit_ID: parseInt(req.body.Unit_ID),
                }
            }).then((v) => {
                if (!v) res.status(404).send('unit not found.');
                res.status(200).send(' unit was deleted seccessfully!');
                return;
            })
        }


    } catch (error) {
        dbErrorHandler(res, error, 'delete real estate unit');
        console.log(error.message);
    }
}


module.exports = {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
}