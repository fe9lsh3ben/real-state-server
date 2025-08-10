

const { Direction } = require('@prisma/client');
const { dbErrorHandler } = require('../libraries/utilities');

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
    try {
        const {
            AD_Specifications,
            AD_Type,
            AD_Unit_Type,
            Office_ID,
            Unit_ID,
            Fal_License_Number,
            Expiry_Date,
            Role
        } = req.body;

        let initiatorInfo;
        if (Role === "REAL_ESTATE_OFFICE_STAFF") {
            initiatorInfo = await prisma.user.findUnique({
                where: {
                    User_ID: req.body.User_ID
                },
                select: {
                    Full_Name: true,
                    Employer_REO_ID: true
                }
            });
            if (initiatorInfo.Employer_REO_ID !== req.body.Office_ID) {
                return res.status(401).send("Unauthorized");
            }
        } else if (Role === "REAL_ESTATE_OFFICE_OWNER") {
            initiatorInfo = await prisma.user.findUnique({
                where: {
                    User_ID: req.body.User_ID
                },
                select: {
                    Full_Name: true
                }
            });
        } else {
            return res.status(401).send("Unauthorized");
        }
        // Check required fields
        const missingFields = [];
        if (!AD_Specifications) missingFields.push("AD Content");
        if (!AD_Type) missingFields.push("AD Type");
        if (!AD_Unit_Type) missingFields.push("AD Unit Type");
        if (!Office_ID) missingFields.push("Office ID");
        if (!Unit_ID) missingFields.push("Unit ID");
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

        const dataEntry = {
            Office_ID: Office_ID,
            Unit_ID: Unit_ID,
            AD_Type,
            AD_Unit_Type,
            AD_Specifications,
            AD_Started_At: new Date(),
            AD_Expiry: Expiry_Date ? new Date(Expiry_Date) : new Date("2026-12-31"),
            Hedden: false,
        };




        const Initiator = {
            User_ID: req.body.User_ID,
            Full_Name: initiatorInfo.Full_Name
        }

        dataEntry.Initiator = Initiator;

        const ad = await prisma.realEstateAD.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate AD was successfully created!.",
            "Unit content": ad
        });

    } catch (error) {
        dbErrorHandler(res, error, "generate real estate ad");
        console.error(error.message);
    }
};



const get_READ = (prisma) => async (req, res) => {

    try {
        const { Search_Type } = req.body;

        switch (Search_Type) {
            case SearchType.COMPLETE: {
                const AD_ID = parseInt(req.body.AD_ID);
                if (isNaN(AD_ID)) return res.status(400).send("Invalid or missing Ad ID.");

                const ad = await prisma.realEstateAD.findUnique({
                    where: { AD_ID },
                    select: {
                        AD_ID: true,
                        AD_Type: true,
                        AD_Unit_Type: true,
                        Indoor_Unit_Images: true,
                        AD_Specifications: true,
                        AD_Started_At: true,
                        Unit_Price: true,
                        Hedden: true,

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

                let where = {};

                if (Office_ID) {
                    if (isNaN(Office_ID)) return res.status(400).send("Invalid or missing Office ID.");
                    where.Office_ID = Office_ID;
                }

                if (AD_Specifications) {
                    try {
                        const parsedSpecs = JSON.parse(AD_Specifications);

                        // Create AND conditions for each key inside AD_Specifications
                        where = Object.entries(parsedSpecs).map(([key, value]) => ({
                            AD_Specifications: {
                                path: [key],
                                equals: value,
                            }
                        }));
                    } catch (err) {
                        return res.status(400).send("Invalid AD Content JSON format.");
                    }
                }

                if (Lower_Price) {
                    if (isNaN(Lower_Price) || Lower_Price < 0) return res.status(400).send("Invalid or missing Lower Price.");
                    where.Unit_Price = {
                        gte: Lower_Price
                    }
                }

                if (Upper_Price) {
                    if (isNaN(Upper_Price) || Upper_Price < 0) return res.status(400).send("Invalid or missing Upper Price.");
                    where.Unit_Price = {
                        lte: Upper_Price
                    }
                }

                if (Region) {
                    where.Unit.is.Region = Region
                }

                if (City) {
                    where.Unit.is.City = City
                }

                if (District) {
                    where.Unit.is.District = District
                }

                if (Direction) {
                    where.Unit.is.Direction = Direction
                }

                if (minLatitude || maxLatitude || minLongitude || maxLongitude) {

                    if (!minLatitude) {
                        return res.status(400).send("Missing minLatitude.");
                    }

                    if (!maxLatitude) {
                        return res.status(400).send("Missing maxLatitude.");
                    }

                    if (!minLongitude) {
                        return res.status(400).send("Missing minLongitude.");
                    }

                    if (!maxLongitude) {
                        return res.status(400).send("Missing maxLongitude.");
                    }

                    where.Unit.is.Latitude = {
                        gte: minLatitude,
                        lte: maxLatitude
                    };
                    where.Unit.is.Longitude = {
                        gte: minLongitude,
                        lte: maxLongitude
                    }
                }

                forMapSelections = {
                    Unit_Price: true,
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
                // const { Geo_level, Geo_value, AD_Type, AD_Unit_Type } = req.body;

                // if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");
                // if (!Geo_level || !Geo_value) {
                //     return res.status(400).send("Missing Geo level or Geo value.");
                // }

                // if (!validAdTypes.includes(AD_Type)) {
                //     return res.status(400).send("Invalid AD_Type value.");
                // }

                // if (!validUnitTypes.includes(AD_Unit_Type)) {
                //     return res.status(400).send("Invalid AD_Unit_Type value.");
                // }




                // // Validate that Geo_level is one of the allowed fields
                // const allowedFields = ['Region', 'City', 'District'];
                // if (!allowedFields.includes(Geo_level)) {
                //     return res.status(400).send("Invalid Geo_level.");
                // }

                // // Build dynamic where clause
                // const whereClause = {
                //     [Geo_level]: Geo_value
                // };

                // const ads = await prisma.realEstateAD.findMany({
                //     where: {
                //         AND: [
                //             { AD_Type: AD_Type },
                //             { AD_Unit_Type: AD_Unit_Type },
                //             { Hedden: false },
                //             { Unit: { is: whereClause }, },
                //         ]
                //     },
                //     select: {
                //         Unit_Price: true,
                //         Visable_Zoom: true,
                //         Hedden: true,
                //     }
                // });

                // if (!ads.length) return res.status(404).send('No Real Estate units found.');
                // const unitsWithFirstImage = ads.map(ad => ({
                //     ...ad,
                //     Outdoor_Unit_Images: ad.Outdoor_Unit_Images?.[0] || null
                // }));

                // return res.status(200).send(unitsWithFirstImage);



            case SearchType.FOR_LIST: {
                const {
                    Office_ID,
                    Unit_ID,
                    AD_Type,
                    AD_Unit_Type,
                    Unit_Price,

                    Region,
                    City,
                    District,
                    Direction,
                    minLatitude,
                    maxLatitude,
                    minLongitude,
                    maxLongitude
                } = req.body;

                
                // const { minLatitude, maxLatitude, minLongitude, maxLongitude, AD_Type, AD_Unit_Type } = req.body;

                // if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");

                // if (!validAdTypes.includes(AD_Type)) {
                //     return res.status(400).send("Invalid AD_Type value.");
                // }

                // if (!validUnitTypes.includes(AD_Unit_Type)) {
                //     return res.status(400).send("Invalid AD_Unit_Type value.");
                // }

                // if (
                //     isNaN(minLatitude) || isNaN(maxLatitude) ||
                //     isNaN(minLongitude) || isNaN(maxLongitude)
                // ) {
                //     return res.status(400).send("bounds are invalid.");
                // }

                // const ads = await prisma.realEstateAD.findMany({
                //     where: {
                //         AND: [
                //             { AD_Type: AD_Type },
                //             { Hedden: false },
                //             { AD_Unit_Type: AD_Unit_Type },
                //             {
                //                 Unit: {
                //                     is: {
                //                         Latitude: { gte: minLatitude, lte: maxLatitude },
                //                         Longitude: { gte: minLongitude, lte: maxLongitude }
                //                     }
                //                 },
                //             },
                //         ]
                //     },
                //     select: {
                //         Unit_Price: true,
                //         Visable_Zoom: true,
                //     }
                // });

                // if (!ads.length) return res.status(404).send('No Real Estate units found in screen bounds.');
                // return res.status(200).send(ads);
            }


            // case SearchType.SEARCH_DIRECTION: {
            //     const { Direction, City, AD_Type, AD_Unit_Type } = req.body;

            //     if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");

            //     if (!validAdTypes.includes(AD_Type)) {
            //         return res.status(400).send("Invalid AD_Type value.");
            //     }

            //     if (!validUnitTypes.includes(AD_Unit_Type)) {
            //         return res.status(400).send("Invalid AD_Unit_Type value.");
            //     }

            //     if (!Direction) return res.status(400).send("Direction is required.");

            //     const ads = await prisma.realEstateAD.findMany({
            //         where: {
            //             AND: [
            //                 { AD_Type: AD_Type },
            //                 { AD_Unit_Type: AD_Unit_Type },
            //                 { Hedden: false },
            //                 { Unit: { is: { Direction: Direction, City: City } } },
            //             ]

            //         }
            //     });

            //     if (!ads.length) return res.status(404).send('No Real Estate units found for that direction.');
            //     return res.status(200).send(ads);
            // }

            // case SearchType.CUSTOM_SEARCH: {
            //     const { City, Direction, AD_Specifications, AD_Type, AD_Unit_Type, Lower_Price, Upper_Price } = req.body;

            //     if (!AD_Type || !AD_Unit_Type) return res.status(400).send("Missing AD type and AD unit type are required.");

            //     if (!validAdTypes.includes(AD_Type)) {
            //         return res.status(400).send("Invalid AD_Type value.");
            //     }

            //     if (!validUnitTypes.includes(AD_Unit_Type)) {
            //         return res.status(400).send("Invalid AD_Unit_Type value.");
            //     }
            //     const filters = {};

            //     if (Lower_Price && Upper_Price) {
            //         if (isNaN(Lower_Price) || isNaN(Upper_Price)) {
            //             return res.status(400).send("Price range is invalid.");
            //         }

            //         if (Lower_Price < 0 || Upper_Price < 0) {
            //             return res.status(400).send("Price range is invalid.");
            //         }

            //         if (Lower_Price > Upper_Price) {
            //             return res.status(400).send("Invalid price range.");
            //         }

            //         filters.Unit_Price = { gte: Lower_Price, lte: Upper_Price };

            //     }


            //     if (!City) return res.status(400).send("City is required.");

            //     filters.Unit = { is: { City: City, Direction: Direction } };

            //     if (AD_Specifications) {
            //         try {
            //             const parsedSpecs = JSON.parse(AD_Specifications);

            //             // Create AND conditions for each key inside AD_Specifications
            //             filters = Object.entries(parsedSpecs).map(([key, value]) => ({
            //                 AD_Specifications: {
            //                     path: [key],
            //                     equals: value,
            //                 }
            //             }));
            //         } catch (err) {
            //             return res.status(400).send("Invalid AD Content JSON format.");
            //         }
            //     }

            //     const units = await prisma.realEstateAD.findMany({
            //         where: {
            //             AND: [
            //                 { AD_Type: AD_Type },
            //                 { AD_Unit_Type: AD_Unit_Type },
            //                 { Hedden: false },
            //                 filters,
            //             ]
            //         },
            //     });

            //     if (!units.length)
            //         return res.status(404).send('No Real Estate units found for that criteria.');

            //     return res.status(200).send(units);
            // }


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
            REU_ID,
            Unit_Type,
            Deed_Owners,
            Specifications,
            Outdoor_Unit_Images
        } = req.body;

        if (!REU_ID) {
            return res.status(400).send("REU_ID is required to update the unit.");
        }

        if (!(Unit_Type || Deed_Owners || Specifications || Outdoor_Unit_Images)) {
            return res.status(400).send("Nothing to update.");
        }

        const updateData = {
            ...(Unit_Type && { Unit_Type }),
            ...(Deed_Owners && { Deed_Owners }),
            ...(Specifications && { Specifications }),
            ...(Outdoor_Unit_Images && { Outdoor_Unit_Images }),
        };

        const updatedUnit = await prisma.realEstateUnit.update({
            where: { REU_ID: parseInt(REU_ID) },
            data: updateData,
        });

        return res.status(202).json({
            message: 'Real Estate Unit updated successfully.',
            data: updatedUnit
        });

    } catch (error) {
        dbErrorHandler(res, error, 'edit real estate unit');
    }
};


const delete_READ = (prisma) => async (req, res) => {
    try {
        const { AD_ID } = req.body;

        if (!AD_ID) {
            return res.status(400).send("AD_ID is required to delete the Real Estate AD.");
        }

        const deletedAD = await prisma.realEStateAD.delete({
            where: { AD_ID: parseInt(AD_ID) },
        });

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