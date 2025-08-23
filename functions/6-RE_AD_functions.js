

const { dbErrorHandler, deleteAd } = require('../libraries/utilities');

const SearchType = Object.freeze({
    FOR_MAP: 'for_map',
    FOR_LIST: 'for_list',
    COMPLETE: 'complete',
});

const validAdTypes = ["RENT", "SELL", "INVESTMENT", "SERVICE"];
const validUnitTypes = [
    "LAND", "BAUILDING", "APARTMENT", "VILLA", "STORE", "FARM",
    "CORRAL", "STORAGE", "OFFICE", "SHOWROOM", "OTHER"
];



const generate_READ = (prisma) => async (req, res) => {

    let ad;
    try {
        const {
            Unit_ID,
            AD_Type,
            AD_Unit_Type,
            Indoor_Unit_Images,
            AD_Specifications,
            Unit_Price,
            Office_ID,
            Fal_License_Number,
        } = req.body;


        // Check required fields
        const missingFields = [];
        if (!Unit_ID) missingFields.push("Unit ID");
        if (!AD_Type) missingFields.push("AD Type");
        if (!AD_Unit_Type) missingFields.push("AD Unit Type");
        // if (!Indoor_Unit_Images) missingFields.push("Indoor Unit Images");
        if (!AD_Specifications) missingFields.push("AD Content");
        if (!Unit_Price) missingFields.push("Unit Price");
        if (!Office_ID) missingFields.push("Office ID");
        if (!Fal_License_Number) missingFields.push("Fal License Number");

        if (missingFields.length > 0) {
            return res.status(400).send(`Missing required fields: ${missingFields.join(", ")}`);
        }

        if (!validAdTypes.includes(AD_Type)) {
            return res.status(400).send("Invalid AD_Type value.");
        }

        if (!validUnitTypes.includes(AD_Unit_Type)) {
            return res.status(400).send("Invalid AD_Unit_Type value.");
        }

        const Initiator = { Created_By: { User_ID: req.body.User_ID, Full_Name: req.body.Full_Name }, Edited_By: [] };

        const dataEntry = {
            Office_ID: Office_ID,
            Unit_ID: Unit_ID,
            AD_Type,
            AD_Unit_Type,
            // Indoor_Unit_Images,
            AD_Specifications,
            AD_Started_At: new Date(),
            Hedden: false,
            Initiator
        };





        ad = await prisma.realEstateAD.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate AD was successfully created!.",
            "Unit content": ad
        });

    } catch (error) {

        if (typeof ad !== "undefined" && ad?.AD_ID) {
            await prisma.realEstateAD.delete({ where: { AD_ID: ad.AD_ID } });
            console.log('Error occurred and ad was deleted!');
        }
        dbErrorHandler(res, error, "generate real estate ad");
        console.error(error.message);
    }
};



const get_READ = (prisma) => async (req, res) => {

    try {
        const { Search_Type } = req.body;

        switch (Search_Type) {
            case SearchType.COMPLETE: {
                Object.assign(req.body, req.query);
                const AD_ID = parseInt(req.body.AD_ID);
                if (isNaN(AD_ID)) return res.status(400).send("Invalid or missing Ad ID.");

                const ad = await prisma.realEstateAD.findUnique({
                    where: { AD_ID },
                    include: {
                        Initiator_Office: {
                            select: {
                                Office_ID: true,
                                Office_Name: true,
                                Office_Phone: true,
                                Rating: true
                            }
                        },
                        Unit: {
                            select: {
                                Unit_ID: true,
                                Unit_Type: true,
                                RE_Name: true,
                                Region: true,
                                City: true,
                                District: true,
                                Direction: true,
                                Latitude: true,
                                Longitude: true,
                                Outdoor_Unit_Images: true,
                            }
                        }

                    }
                });

                if (!ad) return res.status(404).send('Real Estate ad not found.');
             
                if(!req.body.Office_ID || ad.Office_ID !== parseInt(req.body.Office_ID)) {
                    delete ad.Initiator;
                    delete ad.AD_Started_At;
                    delete ad.Visable_Zoom;
                    delete ad.Hedden;
                };
                return res.status(200).send(ad);
            }

            case SearchType.FOR_MAP: {
                const {
                    Office_ID,
                    AD_Type,
                    AD_Unit_Type,
                    AD_Specifications,
                    Lower_Price,
                    Upper_Price,

                    Region,
                    City,
                    District,
                    Direction,
                    minLatitude,
                    maxLatitude,
                    minLongitude,
                    maxLongitude
                } = req.body;

                if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");

                if (!validAdTypes.includes(AD_Type)) {
                    return res.status(400).send("Invalid AD_Type value.");
                }

                if (!validUnitTypes.includes(AD_Unit_Type)) {
                    return res.status(400).send("Invalid AD_Unit_Type value.");
                }

                const where = {};
                where.AND = [{
                    Hedden: false,
                    Unit: {
                        is: {}
                    }
                }];

                if (Office_ID) {
                    if (isNaN(Office_ID)) return res.status(400).send("Invalid or missing Office ID.");
                    where.AND.push({ Office_ID: Office_ID });
                }


                if (Lower_Price) {
                    if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send("Invalid or missing Lower Price.");
                    where.AND.push({ Unit_Price: { gte: Lower_Price } });

                }

                if (Upper_Price) {
                    if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send("Invalid or missing Upper Price.");
                    where.AND.push({ Unit_Price: { lte: Upper_Price } });

                }


                if (AD_Specifications) {
                    try {
                        const parsedSpecs = JSON.parse(AD_Specifications);

                        const specFilters = Object.entries(parsedSpecs).map(([key, value]) => ({
                            AD_Specifications: {
                                path: [key],
                                equals: value
                            }
                        }));

                        // Add to existing AND clause if present

                        where.AND.push(...specFilters);


                    } catch (err) {
                        return res.status(400).send("Invalid AD Content JSON format.");
                    }
                }

                // Location filters
                const unitWhere = where.AND[0].Unit.is;
                if (Region) unitWhere.Region = Region;
                if (City) unitWhere.City = City;
                if (District) unitWhere.District = District;
                if (Direction) unitWhere.Direction = Direction;

                // Geo box
                const allCoords = [minLatitude, maxLatitude, minLongitude, maxLongitude];
                if (allCoords.some(coord => coord !== undefined)) {
                    if (allCoords.some(coord => coord === undefined || isNaN(coord))) {
                        return res.status(400).send("Invalid or incomplete map bounds.");
                    }

                    unitWhere.Latitude = { gte: Number(minLatitude), lte: Number(maxLatitude) };
                    unitWhere.Longitude = { gte: Number(minLongitude), lte: Number(maxLongitude) };
                }

                forMapSelections = {
                    Unit_Price: true,
                    Visable_Zoom: true,
                    Unit: {
                        select: {
                            Latitude: true,
                            Longitude: true,
                        }
                    }
                }

                const ads = await prisma.realEstateAD.findMany({
                    where,
                    select: forMapSelections
                });

                return res.status(200).send(ads);

            }


            case SearchType.FOR_LIST: {

                const {
                    Office_ID,
                    AD_Type,
                    AD_Unit_Type,
                    AD_Specifications,
                    Lower_Price,
                    Upper_Price,

                    Region,
                    City,
                    District,
                    Direction,
                    minLatitude,
                    maxLatitude,
                    minLongitude,
                    maxLongitude
                } = req.body;

                if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");

                if (!validAdTypes.includes(AD_Type)) {
                    return res.status(400).send("Invalid AD_Type value.");
                }

                if (!validUnitTypes.includes(AD_Unit_Type)) {
                    return res.status(400).send("Invalid AD_Unit_Type value.");
                }

                const where = {};
                where.AND = [{
                    Hedden: false,
                    Unit: {
                        is: {}
                    }
                }];

                if (Office_ID) {
                    if (isNaN(Office_ID)) return res.status(400).send("Invalid or missing Office ID.");
                    where.AND.push({ Office_ID: Office_ID });
                }


                if (Lower_Price) {
                    if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send("Invalid or missing Lower Price.");
                    where.AND.push({ Unit_Price: { gte: Lower_Price } });

                }

                if (Upper_Price) {
                    if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send("Invalid or missing Upper Price.");
                    where.AND.push({ Unit_Price: { lte: Upper_Price } });

                }


                if (AD_Specifications) {
                    try {
                        const parsedSpecs = JSON.parse(AD_Specifications);

                        const specFilters = Object.entries(parsedSpecs).map(([key, value]) => ({
                            AD_Specifications: {
                                path: [key],
                                equals: value
                            }
                        }));

                        // Add to existing AND clause if present

                        where.AND.push(...specFilters);


                    } catch (err) {
                        return res.status(400).send("Invalid AD Content JSON format.");
                    }
                }

                // Location filters
                const unitWhere = where.AND[0].Unit.is;
                if (Region) unitWhere.Region = Region;
                if (City) unitWhere.City = City;
                if (District) unitWhere.District = District;
                if (Direction) unitWhere.Direction = Direction;

                // Geo box
                const allCoords = [minLatitude, maxLatitude, minLongitude, maxLongitude];
                if (allCoords.some(coord => coord !== undefined)) {
                    if (allCoords.some(coord => coord === undefined || isNaN(coord))) {
                        return res.status(400).send("Invalid or incomplete map bounds.");
                    }

                    unitWhere.Latitude = { gte: Number(minLatitude), lte: Number(maxLatitude) };
                    unitWhere.Longitude = { gte: Number(minLongitude), lte: Number(maxLongitude) };
                }



                const forListSelections = {
                    AD_ID: true,
                    AD_Type: true,
                    AD_Unit_Type: true,
                    Unit_Price: true,
                    AD_Started_At: true,
                    Indoor_Unit_Images: true,
                }

                const ads = await prisma.realEstateAD.findMany({
                    where,
                    select: forListSelections
                });



                // Replace Indoor_Unit_Images array with the first image only
                const adsWithFirstImage = ads.map(ad => ({
                    ...ad,
                    Indoor_Unit_Images: ad.Indoor_Unit_Images?.[0] || null
                }));

                return res.status(200).send(adsWithFirstImage);


            }


            default:
                return res.status(400).send('Invalid Search_Type.');
        }

    } catch (error) {
        console.log('Error:', error.message);
        return dbErrorHandler(res, error, 'get REO');
    }
};


const edit_READ = (prisma) => async (req, res) => {
    try {
        const {
            AD_ID,
            AD_Type,
            AD_Unit_Type,
            AD_Specifications,
            Hedden,
            Unit_Price,
            Indoor_Unit_Images,
            Full_Name,

        } = req.body;

        if (!AD_ID) {
            return res.status(400).send("Ad ID is required to update the unit.");
        }

        if (!(AD_Type || AD_Unit_Type || AD_Specifications || Indoor_Unit_Images || Unit_Price || Hedden)) {
            return res.status(400).send("Nothing to update.");
        }

        if (AD_Type && !validAdTypes.includes(AD_Type)) {
            return res.status(400).send("Invalid AD_Type value.");
        }

        if (AD_Unit_Type && !validUnitTypes.includes(AD_Unit_Type)) {
            return res.status(400).send("Invalid AD_Unit_Type value.");
        }

        const ad = await prisma.realEstateAD.findUnique({
            where: { AD_ID: parseInt(AD_ID) }
        });

        if (!ad) {
            return res.status(404).send("Ad not found.");
        }


        if (Array.isArray(ad.Initiator.Edited_By)) {
            ad.Initiator.Edited_By.push({
                User_ID: req.body.User_ID,
                Full_Name,
                Edited_At: new Date().toISOString(),
                Changed: {
                    ...(AD_Type && { AD_Type }),
                    ...(AD_Unit_Type && { AD_Unit_Type }),
                    ...(AD_Specifications && { AD_Specifications }),
                    ...(Indoor_Unit_Images && { Indoor_Unit_Images: true }),
                    ...(Unit_Price && { Unit_Price }),
                    ...(Hedden !== undefined && { Hedden }),
                }
            });
        } else {
            ad.Initiator.Edited_By = [{
                User_ID: req.body.User_ID,
                Full_Name,
                Edited_At: new Date().toISOString(),
                Changed: {
                    ...(AD_Type && { AD_Type }),
                    ...(AD_Unit_Type && { AD_Unit_Type }),
                    ...(AD_Specifications && { AD_Specifications }),
                    ...(Indoor_Unit_Images && { Indoor_Unit_Images: true }),
                    ...(Unit_Price && { Unit_Price }),
                    ...(Hedden !== undefined && { Hedden }),
                }
            }];
        }



        const updateData = {
            ...(AD_Type && { AD_Type }),
            ...(AD_Unit_Type && { AD_Unit_Type }),
            ...(AD_Specifications && { AD_Specifications }),
            ...(Indoor_Unit_Images && { Indoor_Unit_Images }),
            ...(Unit_Price && { Unit_Price }),
            ...(Hedden !== undefined && { Hedden }),
            Initiator: ad.Initiator
        };


        const updatedUnit = await prisma.realEstateAD.update({
            where: { AD_ID: parseInt(AD_ID) },
            data: updateData,
        });

        return res.status(202).json({
            message: 'AD was updated successfully.',
            data: updatedUnit
        });

    } catch (error) {
        dbErrorHandler(res, error, 'edit real estate unit');
        console.log('Error:', error.message);
    }
};


const delete_READ = (prisma) => async (req, res) => {
    try {
        const { AD_ID } = req.body;

        if (!AD_ID) {
            return res.status(400).send("AD_ID is required to delete the Real Estate AD.");
        }

        const deletedAD = await prisma.realEstateAD.delete({
            where: { AD_ID: parseInt(AD_ID) },
        });

        deleteAd(deletedAD.AD_ID, 'realEstateAD', req.body.User_ID);

        return res.status(200).json({
            message: "Real Estate AD was successfully deleted.",
            data: deletedAD,
        });

    } catch (error) {
        dbErrorHandler(res, error, 'delete real estate ad');
    }
};



module.exports = {
    generate_READ,
    get_READ,
    edit_READ,
    delete_READ,
}