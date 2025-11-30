
const { parse } = require('dotenv');
const { dbErrorHandler, deleteAd } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
    CUSTOM_SEARCH: 'custom_search',
});

const validUnitTypes = [
    "LAND", "BUILDING", "APARTMENT", "VILLA", "STORE", "FARM",
    "CORRAL", "STORAGE", "OFFICE", "SHOWROOM", "WEDDING_HALL", "OTHER"
];

const generate_REU = (prisma) => async (req, res) => {
    let createdREUnit;
    try {

        const {
            Unit_Type,
            RE_Name,
            Deed_Number,
            Deed_Date,
            Deed_Owners,
            Address,
            Outdoor_Unit_Images,
        } = req.body;


        const missingFields = [];
        if (!Unit_Type) missingFields.push("Unit Type");
        if (!RE_Name) missingFields.push("RE Name");
        if (!Deed_Number) missingFields.push("Deed Number");
        if (!Deed_Date) missingFields.push("Deed Date");
        if (!Deed_Owners) missingFields.push("Deed Owners");
        if (!Address) missingFields.push("Address");


        if (missingFields.length > 0) {
            return res.status(400).send(`Missing required fields: ${missingFields.join(", ")}`);
        }
        if (!validUnitTypes.includes(Unit_Type)) {
            res.status(400).send({ 'message': 'Invalid Unit Type.' });
            return;
        }

        let reu = await prisma.realEstateUnit.findUnique({
            where: {
                Deed_Number: Deed_Number
            }
        });

        if (reu) {
            res.status(400).send({ 'message': 'Real Estate Unit already exists with this Deed Number.' });
            return;
        }
        const { Region, City, District, Direction, Latitude, Longitude } = Address;

        const user = await prisma.user.findUnique({
            where: {
                User_ID: req.body.User_ID
            },
            select: {
                Full_Name: true
            }
        })

        const Initiator = { Created_By: { User_ID: req.body.User_ID, Full_Name: user.Full_Name }, Edited_By: [] };

        const dataEntry = {
            Unit_Type,
            RE_Name,
            Deed_Number,
            Deed_Date: new Date(Deed_Date),
            Deed_Owners,
            Affiliated_Office_ID: req.body.Office_ID,
            Initiator,
            Region,
            City,
            District,
            Direction,
            Latitude,
            Longitude,
            ...(Outdoor_Unit_Images && { Outdoor_Unit_Images })
        };

        if (req.body.Polygon) {
            dataEntry.Polygon = await prisma.realEstateUnit.create_WKT_Polygon(req.body.Polygon)
        }

        createdREUnit = await prisma.realEstateUnit.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate Unit was successfully created!",
            "Unit content": createdREUnit
        });
    } catch (error) {
        if (typeof createdREUnit !== "undefined" && createdREUnit?.Unit_ID) {
            await prisma.realEstateUnit.delete({ where: { Unit_ID: createdREUnit.Unit_ID } });
            console.log('Error occurred and unit was deleted!');
        }
        dbErrorHandler(res, error, 'generate real estate unit');
        console.log(error.message);
    }


}
const get_REU = (prisma) => async (req, res) => {
    try {
        const { Search_Type } = req.body;

        switch (Search_Type) {
            case SearchType.SEARCH_ONE: {
                const Unit_ID = parseInt(req.body.Unit_ID);
                if (isNaN(Unit_ID)) return res.status(400).send({ 'message': "Invalid or missing Unit ID." });

                const unit = await prisma.realEstateUnit.findUnique({ where: { Unit_ID } });
                if (!unit) return res.status(404).send({ 'message': 'Real Estate unit not found.' });

                return res.status(200).send(unit);
            }

            case SearchType.SEARCH_MANY: {
                const { Geo_level, Geo_value } = req.body;

                if (!Geo_level || !Geo_value) {
                    return res.status(400).send({ 'message': "Missing Geo_level or Geo_value." });
                }

                // Validate that Geo_level is one of the allowed fields
                const allowedFields = ['Region', 'City', 'District'];
                if (!allowedFields.includes(Geo_level)) {
                    return res.status(400).send({ 'message': "Invalid Geo_level." });
                }

                // Build dynamic where clause
                const whereClause = {
                    [Geo_level]: Geo_value
                };

                const units = await prisma.realEstateUnit.findMany({
                    where: whereClause
                });

                if (!units.length) return res.status(404).send({ 'message': 'No Real Estate units found.' });
                return res.status(200).send(units);

            }

            case SearchType.SEARCH_ON_SCREEN: {
                const { minLatitude, maxLatitude, minLongitude, maxLongitude } = req.body;

                if (
                    isNaN(minLatitude) || isNaN(maxLatitude) ||
                    isNaN(minLongitude) || isNaN(maxLongitude)
                ) {
                    return res.status(400).send({ 'message': "bounds are invalid." });
                }

                const units = await prisma.realEstateUnit.findMany({
                    where: {

                        Latitude: {
                            gte: parseFloat(minLatitude),
                            lte: parseFloat(maxLatitude),
                        },

                        Longitude: {
                            gte: parseFloat(minLongitude),
                            lte: parseFloat(maxLongitude),
                        },

                    },
                });

                if (!units.length) return res.status(404).send({ 'message': 'No Real Estate units found in screen bounds.' });
                return res.status(200).send(units);
            }


            case SearchType.SEARCH_DIRECTION: {
                const { Direction, City } = req.body;
                if (!Direction) return res.status(400).send({ 'message': "Direction is required." });

                const units = await prisma.realEstateUnit.findMany({
                    where: {
                        AND: [
                            { Direction: Direction },
                            { City: City },
                        ]

                    }
                });

                if (!units.length) return res.status(404).send({ 'message': 'No Real Estate units found for that direction.' });
                return res.status(200).send(units);
            }

            case SearchType.CUSTOM_SEARCH: {
                const { City, Unit_Type, Direction } = req.body;

                const filters = {};
                if (!City) return res.status(400).send({ 'message': "City is required." });

                filters.City = City;
                if (Unit_Type) filters.Unit_Type = Unit_Type;
                if (Direction) filters.Direction = Direction;


                const units = await prisma.realEstateUnit.findMany({ where: filters });

                if (!units.length)
                    return res.status(404).send({ 'message': 'No Real Estate units found for that criteria.' });

                return res.status(200).send(units);
            }


            default:
                return res.status(400).send({ 'message': 'Invalid Search_Type.' });
        }

    } catch (error) {
        console.log('Error:', error.message);
        return dbErrorHandler(res, error, 'get REO');
    }
};


const update_REU = (prisma) => async (req, res) => {
    try {
        const {
            Unit_ID,
            Unit_Type,
            Deed_Owners,
            Outdoor_Unit_Images,
            Full_Name,
        } = req.body;

        if (!Unit_ID) {
            return res.status(400).send({ 'message': 'Unit_ID is required.' });
        }

        // Ensure at least one field to update is present
        if (!(Unit_Type || Deed_Owners || Outdoor_Unit_Images)) {
            return res.status(400).send({ 'message': 'Nothing to change?!...' });
        }

        const existingUnit = await prisma.realEstateUnit.findUnique({
            where: { Unit_ID: parseInt(Unit_ID) },
            select: { Initiator: true }
        });

        if (!existingUnit) {
            return res.status(404).send({ 'message': 'Real Estate Unit not found.' });
        }

        if (Array.isArray(existingUnit.Initiator.Edited_By)) {
            existingUnit.Initiator.Edited_By.push({
                User_ID: req.body.User_ID,
                Full_Name,
                Edited_At: new Date().toISOString()
            });
        } else {
            existingUnit.Initiator.Edited_By = [{
                User_ID: req.body.User_ID,
                Full_Name,
                Edited_At: new Date().toISOString()
            }];
        }


        const updateData = {
            ...(Unit_Type && { Unit_Type }),
            ...(Deed_Owners && { Deed_Owners }),
            ...(Outdoor_Unit_Images && { Outdoor_Unit_Images }),
            Initiator: existingUnit.Initiator
        };

        const updatedUnit = await prisma.realEstateUnit.update({
            where: { Unit_ID: parseInt(Unit_ID) },
            data: updateData
        });

        return res.status(202).json({
            message: 'Data was updated',
            data: updatedUnit
        });

    } catch (error) {
        dbErrorHandler(res, error, 'update real estate unit');
        console.error(error.message);
    }
};

const delete_REU = (prisma) => async (req, res) => {
    try {
        // Merge body params into body if provided (for flexibility)


        const unitId = parseInt(req.body.Unit_ID);

        if (!unitId) {
            return res.status(400).send({ 'message': "Real estate unit ID is required!" });
        }
        const deletedUnit = await prisma.realEstateUnit.delete({
            where: { Unit_ID: unitId },
        });
        if (!deletedUnit) {
            return res.status(404).send({ 'message': "Real estate unit not found!" });
        }

        deleteAd(deletedUnit.Unit_ID, 'realEstateUnit', req.body.User_ID);

        return res.status(200).json({
            message: "Real estate unit was deleted successfully!",
            deletedUnit,
        });

    } catch (error) {
        if (error.code === 'P2025') {

            return res.status(404).send({ 'message': "Real estate unit not found!" });
        }

        dbErrorHandler(res, error, "delete real estate unit");
    }
};



module.exports = {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
}