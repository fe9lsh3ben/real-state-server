
const { tokenMiddlewere } = require('./token_functions');
const { dbErrorHandler, SearchType } = require('../libraries/utilities');
const { officeAuthentication, REUAuthentication, READAuthentication } = require('../middlewares/authentications');



const validAdTypes = ["RENT", "SELL", "INVESTMENT", "SERVICE"];
const validUnitTypes = [
    "LAND", "BUILDING", "APARTMENT", "VILLA", "STORE", "FARM",
    "CORRAL", "STORAGE", "OFFICE", "SHOWROOM", "WEDDING_HALL", "OTHER"
];



const generate_READ = (prisma) => async (req, res) => {
    let ad;
    try {
        const {
            Unit_ID,
            AD_Type,
            AD_Unit_Type,
            AD_Title,
            Indoor_Unit_Images,
            AD_Specifications,
            Unit_Price,
            My_Office_ID,
        } = req.body;

        // Check required fields
        const missingFields = [];
        if (!Unit_ID) missingFields.push("Unit ID");
        if (!AD_Type) missingFields.push("AD Type");
        if (!AD_Unit_Type) missingFields.push("AD Unit Type");
        if (!AD_Title) missingFields.push("AD Title");
        if (!AD_Specifications) missingFields.push("AD Content");
        if (Unit_Price === null || Unit_Price === undefined) missingFields.push("Unit Price");
        if (!My_Office_ID) missingFields.push("Office ID");

        if (missingFields.length > 0) {
            return res.status(400).send({ 'message': `Missing required fields: ${missingFields.join(", ")}` });
        }

        if (!validAdTypes.includes(AD_Type)) {
            return res.status(400).send({ 'message': "Invalid AD_Type value." });
        }
        if (!validUnitTypes.includes(AD_Unit_Type)) {
            return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
        }


        if (isNaN(Unit_Price) || Unit_Price < 0) {
            return res.status(400).send({ 'message': "Invalid price value." });
        }

        const Initiator = { Created_By: { User_ID: req.body.User_ID, Full_Name: req.body.Full_Name }, Edited_By: [] };


        const dataEntry = {
            Office_ID: My_Office_ID,
            Unit_ID: Unit_ID,
            AD_Type,
            AD_Unit_Type,
            AD_Title,
            ...(Indoor_Unit_Images && { Indoor_Unit_Images }),
            ...(Unit_Price && { Unit_Price }),
            AD_Specifications,
            Hedden: false,
            Initiator
        };


        ad = await prisma.realEstateAD.create({
            data: dataEntry
        });

        ad = {
            ...ad,
            Indoor_Unit_Images: ad.Indoor_Unit_Images?.[0] || null
        };
        res.status(201).json({
            message: "Real Estate AD was successfully created!.",
            "Ad_Content": ad
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
        // Ensure body exists before merging
        req.body = req.body || {};
        Object.assign(req.body, req.query);

        const { Search_Type } = req.body;

        switch (Search_Type) {
            case SearchType.DETAIL_VIEW: {
                Object.assign(req.body, req.query);
                let AD_ID;
                if (!req.body.AD_ID) {
                    return res.status(400).send({ 'message': "Ad ID is required." });
                }
                if (typeof req.body.AD_ID === 'string') {
                    AD_ID = parseInt(req.body.AD_ID);
                }
                if (isNaN(AD_ID)) return res.status(400).send({ 'message': "Invalid Ad ID." });

                const ad = await prisma.realEstateAD.findFirst({
                    where: {
                        AD_ID,
                        Hedden: false,
                    },
                    select: {
                        AD_ID: true,
                        Office_ID: true,
                        AD_Type: true,
                        AD_Unit_Type: true,
                        AD_Title: true,
                        Indoor_Unit_Images: true,
                        AD_Specifications: true,
                        Unit_Price: true,
                        Unit_ID: true,
                        Hedden: true,
                        Initiator_Office: {
                            select: {
                                Office_Phone: true,
                            }
                        },
                        Unit: {
                            select: {
                                City: true,
                                District: true,
                                Direction: true,
                                Latitude: true,
                                Longitude: true,
                                Outdoor_Unit_Images: true,
                            }
                        },

                    },
                });
                if (!ad) {
                    const lastAd = await prisma.realEstateAD.findFirst({
                        orderBy: {
                            AD_ID: 'desc',
                        },
                        select: {
                            AD_ID: true,
                        },

                    });
                    if (lastAd.AD_ID >= AD_ID) {
                        return res.status(400).send({ 'message': 'Real Estate ad was deleted.' });
                    }
                    else {
                        return res.status(404).send({ 'message': 'Real Estate ad not found.' });
                    }
                }

                // if (!req.body.Office_ID || ad.Office_ID !== parseInt(req.body.Office_ID)) {
                //     delete ad.Initiator;
                //     delete ad.Visable_Zoom;
                //     delete ad.Hedden;
                // };   

                return res.status(200).send([ad]);
            }

            case SearchType.MAP_PINS_VIEW: {
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

                if (!AD_Type || !AD_Unit_Type) return res.status(400).send({ 'message': "Missing AD type and AD unit type are required." });

                if (!validAdTypes.includes(AD_Type)) {
                    return res.status(400).send({ 'message': "Invalid AD_Type value." });
                }

                if (!validUnitTypes.includes(AD_Unit_Type)) {
                    return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
                }

                const where = {};
                where.AND = [{
                    Hedden: false,
                    Unit: {
                        is: {}
                    }
                }];

                if (Office_ID) {
                    if (isNaN(Office_ID)) return res.status(400).send({ 'message': "Invalid or missing Office ID." });
                    where.AND.push({ Office_ID: Office_ID });
                }


                if (Lower_Price) {
                    if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Lower Price." });
                    where.AND.push({ Unit_Price: { gte: Lower_Price } });

                }

                if (Upper_Price) {
                    if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Upper Price." });
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
                        return res.status(400).send({ 'message': "Invalid AD Content JSON format." });
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
                const allValid = allCoords.every(coord => coord !== undefined && !isNaN(coord));

                if (!allValid) {
                    return res.status(400).send({ 'message': "Invalid or incomplete map bounds. All four bounds must be valid." });
                }

                unitWhere.Latitude = { gte: Number(minLatitude), lte: Number(maxLatitude) };
                unitWhere.Longitude = { gte: Number(minLongitude), lte: Number(maxLongitude) };



                forMapSelections = {
                    AD_Title: true,
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


            case SearchType.LIST_VIEW: {

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

                if (!AD_Type || !AD_Unit_Type) return res.status(400).send({ 'message': "Missing AD type and AD unit type are required." });

                if (!validAdTypes.includes(AD_Type)) {
                    return res.status(400).send({ 'message': "Invalid AD_Type value." });
                }

                if (!validUnitTypes.includes(AD_Unit_Type)) {
                    return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
                }

                const where = {};
                where.AND = [{
                    Hedden: false,
                    Unit: {
                        is: {}
                    }
                }];

                if (Office_ID) {
                    if (isNaN(Office_ID)) return res.status(400).send({ 'message': "Invalid or missing Office ID." });
                    where.AND.push({ Office_ID: Office_ID });
                }


                if (Lower_Price) {
                    if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Lower Price." });
                    where.AND.push({ Unit_Price: { gte: Lower_Price } });

                }

                if (Upper_Price) {
                    if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Upper Price." });
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
                        return res.status(400).send({ 'message': "Invalid AD Content JSON format." });
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
                        return res.status(400).send({ 'message': "Invalid or incomplete map bounds." });
                    }

                    unitWhere.Latitude = { gte: Number(minLatitude), lte: Number(maxLatitude) };
                    unitWhere.Longitude = { gte: Number(minLongitude), lte: Number(maxLongitude) };
                }



                const forListSelections = {
                    AD_ID: true,
                    AD_Type: true,
                    AD_Title: true,
                    AD_Unit_Type: true,
                    Unit_Price: true,
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
            case SearchType.OFFICE_DETAIL_VIEW: {
                //Office_ID is required
                return await tokenMiddlewere(req, res,
                    () => officeAuthentication(req, res,
                        () => READAuthentication(req, res,
                            async () => {
                                const AD_ID = parseInt(req.body.AD_ID);
                                if (isNaN(AD_ID)) return res.status(400).send({ 'message': "Invalid or missing Ad ID." });

                                const ad = await prisma.RealEstateAD.findFirst({
                                    where: { AD_ID: AD_ID },
                                    select: {
                                        Initiator: true,
                                        AD_Type: true,
                                        AD_Unit_Type: true,
                                        AD_Title: true,
                                        Indoor_Unit_Images: true,
                                        AD_Specifications: true,
                                        Unit_Price: true,
                                        Hedden: true,
                                        Created_At: true,
                                        Updated_At: true,
                                    }
                                });

                                if (!ad) return res.status(404).send({ 'message': 'Real Estate ad not found.' });

                                return res.status(200).send([ad]);

                            })));



            }
            case SearchType.OFFICE_LIST_VIEW: {
                //Office_ID is required
                Object.assign(req.body, req.query);
                return officeAuthentication(
                    req,
                    res,
                    REUAuthentication(req, res, async () => {
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

                        if (!AD_Type || !AD_Unit_Type) return res.status(400).send({ 'message': "Missing AD type and AD unit type are required." });

                        if (!validAdTypes.includes(AD_Type)) {
                            return res.status(400).send({ 'message': "Invalid AD_Type value." });
                        }

                        if (!validUnitTypes.includes(AD_Unit_Type)) {
                            return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
                        }

                        const where = {};
                        where.AND = [{
                            Unit: {
                                is: {}
                            }
                        }];

                        if (Office_ID) {
                            if (isNaN(Office_ID)) return res.status(400).send({ 'message': "Invalid or missing Office ID." });
                            where.AND.push({ Office_ID: Office_ID });
                        }

                        if (Lower_Price) {
                            if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Lower Price." });
                            where.AND.push({ Unit_Price: { gte: Lower_Price } });

                        }

                        if (Upper_Price) {
                            if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Upper Price." });
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

                                where.AND.push(...specFilters);

                            } catch (err) {
                                return res.status(400).send({ 'message': "Invalid AD Content JSON format." });
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
                                return res.status(400).send({ 'message': "Invalid or incomplete map bounds." });
                            }

                            unitWhere.Latitude = { gte: Number(minLatitude), lte: Number(maxLatitude) };
                            unitWhere.Longitude = { gte: Number(minLongitude), lte: Number(maxLongitude) };
                        }

                        const officeForListSelect = {
                            AD_ID: true,
                            AD_Type: true,
                            AD_Title: true,
                            AD_Unit_Type: true,
                            Unit_Price: true,
                            Indoor_Unit_Images: true,
                        }

                        const ads = await prisma.realEstateAD.findMany({
                            where,
                            select: officeForListSelect

                        });

                        // Replace Indoor_Unit_Images array with the first image only
                        const adsWithFirstImage = ads.map(ad => ({
                            ...ad,
                            Indoor_Unit_Images: ad.Indoor_Unit_Images?.[0] || null
                        }));

                        return res.status(200).send(adsWithFirstImage);
                    }));

            }

            case SearchType.OFFICE_MAP_PINS_VIEW: {
                //Office_ID is required
                Object.assign(req.body, req.query);
                return officeAuthentication(req, res, async () => {
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

                    if (!AD_Type || !AD_Unit_Type) return res.status(400).send({ 'message': "Missing AD type and AD unit type are required." });

                    if (!validAdTypes.includes(AD_Type)) {
                        return res.status(400).send({ 'message': "Invalid AD_Type value." });
                    }

                    if (!validUnitTypes.includes(AD_Unit_Type)) {
                        return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
                    }

                    const where = {};
                    where.AND = [{
                        Unit: {
                            is: {}
                        }
                    }];

                    if (Office_ID) {
                        if (isNaN(Office_ID)) return res.status(400).send({ 'message': "Invalid or missing Office ID." });
                        where.AND.push({ Office_ID: Office_ID });
                    }


                    if (Lower_Price) {
                        if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Lower Price." });
                        where.AND.push({ Unit_Price: { gte: Lower_Price } });

                    }

                    if (Upper_Price) {
                        if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send({ 'message': "Invalid or missing Upper Price." });
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
                            return res.status(400).send({ 'message': "Invalid AD Content JSON format." });
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
                            return res.status(400).send({ 'message': "Invalid or incomplete map bounds." });
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
                });

            }

            case SearchType.OFFICE_CUSTOM_FILTER_QUERY: {
                //Office_ID is required
                return officeAuthentication(req, res, async () => {

                });

            }

            default:
                return res.status(400).send({ 'message': 'Invalid Search_Type.' });
        }

    } catch (error) {
        console.log('Error:', error.message);
        return dbErrorHandler(res, error, 'get READ');
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
            Editor_Name,

        } = req.body;

        if (!AD_ID) {
            return res.status(400).send({ 'message': "Ad ID is required to update the unit." });
        }

        if (!Editor_Name) {
            return res.status(400).send({ 'message': "Your Name is required to update the unit." });
        }
        if (!(AD_Type || AD_Unit_Type || AD_Specifications || Indoor_Unit_Images || Unit_Price || Hedden)) {
            return res.status(400).send({ 'message': "Nothing to update." });
        }

        if (AD_Type && !validAdTypes.includes(AD_Type)) {
            return res.status(400).send({ 'message': "Invalid AD_Type value." });
        }

        if (AD_Unit_Type && !validUnitTypes.includes(AD_Unit_Type)) {
            return res.status(400).send({ 'message': "Invalid AD_Unit_Type value." });
        }

        const ad = await prisma.realEstateAD.findUnique({
            where: { AD_ID: parseInt(AD_ID) }
        });

        if (!ad) {
            return res.status(404).send({ 'message': "Ad not found." });
        }


        if (Array.isArray(ad.Initiator.Edited_By)) {
            ad.Initiator.Edited_By.push({
                User_ID: req.body.User_ID,
                Editor_Name,
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
                Editor_Name,
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
            ...(Hedden && { Hedden: Hedden === 'true' }),
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
        dbErrorHandler(res, error, 'edit real estate ad');
        console.log('Error:', error.message);
    }
};


const delete_READ = (prisma) => async (req, res) => {
    try {
        const { AD_ID } = req.body;

        if (!AD_ID) {
            return res.status(400).send({ 'message': "AD_ID is required to delete the Real Estate AD." });
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