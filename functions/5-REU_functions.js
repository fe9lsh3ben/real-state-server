
const { parse } = require('dotenv');
const { dbErrorHandler } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
    CUSTOM_SEARCH: 'custom_search',
});



const generate_REU = (prisma) => async (req, res) => {

    try {

        const {
            Unit_Type,
            RE_Name,
            Deed_Number,
            Deed_Date,
            Deed_Owners,
            Initiator,
            Address,
            Outdoor_Unit_Images,
        } = req.body;
        if (!(
            Unit_Type && RE_Name && Deed_Number && Deed_Date && Deed_Owners && Initiator && Address
            //&& Outdoor_Unit_Images
        )) {
            res.status(400).send('All fields are required.');
            return;
        }

        let reu = await prisma.realEstateUnit.findUnique({
            where: {
                Deed_Number: Deed_Number
            }
        })

        if (reu) {
            res.status(400).send('Real Estate Unit already exists with this Deed Number.');
            return;
        }
        const { Region, City, District, Direction, Latitude, Longitude } = Address;

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
            Outdoor_Unit_Images,
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
        const { Search_Type } = req.body;

        switch (Search_Type) {
            case SearchType.SEARCH_ONE: {
                const Unit_ID = parseInt(req.body.Unit_ID);
                if (isNaN(Unit_ID)) return res.status(400).send("Invalid or missing Unit ID.");

                const unit = await prisma.realEstateUnit.findUnique({ where: { Unit_ID } });
                if (!unit) return res.status(404).send('Real Estate unit not found.');

                return res.status(200).send(unit);
            }

            case SearchType.SEARCH_MANY: {
                const { Geo_level, Geo_value } = req.body;

                if (!Geo_level || !Geo_value) {
                    return res.status(400).send("Missing Geo_level or Geo_value.");
                }

                // Validate that Geo_level is one of the allowed fields
                const allowedFields = ['Region', 'City', 'District'];
                if (!allowedFields.includes(Geo_level)) {
                    return res.status(400).send("Invalid Geo_level.");
                }

                // Build dynamic where clause
                const whereClause = {
                    [Geo_level]: Geo_value
                };

                const units = await prisma.realEstateUnit.findMany({
                    where: whereClause
                });

                if (!units.length) return res.status(404).send('No Real Estate units found.');
                return res.status(200).send(units);

            }

            case SearchType.SEARCH_ON_SCREEN: {
                const { minLatitude, maxLatitude, minLongitude, maxLongitude } = req.body;

                if (
                    isNaN(minLatitude) || isNaN(maxLatitude) ||
                    isNaN(minLongitude) || isNaN(maxLongitude)
                ) {
                    return res.status(400).send("bounds are invalid.");
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

                if (!units.length) return res.status(404).send('No Real Estate units found in screen bounds.');
                return res.status(200).send(units);
            }


            case SearchType.SEARCH_DIRECTION: {
                const { Direction, City } = req.body;
                if (!Direction) return res.status(400).send("Direction is required.");

                const units = await prisma.realEstateUnit.findMany({
                    where: {
                        AND: [
                            { Direction: Direction },
                            { City: City },
                        ]

                    }
                });

                if (!units.length) return res.status(404).send('No Real Estate units found for that direction.');
                return res.status(200).send(units);
            }

            case SearchType.CUSTOM_SEARCH: {
                const { City, Unit_Type, Direction} = req.body;

                const filters = {};
                if (!City) return res.status(400).send("City is required.");

                filters.City = City;
                if (Unit_Type) filters.Unit_Type = Unit_Type;
                if (Direction) filters.Direction = Direction;


                const units = await prisma.realEstateUnit.findMany({ where: filters });

                if (!units.length)
                    return res.status(404).send('No Real Estate units found for that criteria.');

                return res.status(200).send(units);
            }


            default:
                return res.status(400).send('Invalid Search_Type.');
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
            Edited_By
        } = req.body;

        if (!Unit_ID) {
            return res.status(400).send('Unit_ID is required.');
        }

        // Ensure at least one field to update is present
        if (!(Unit_Type || Deed_Owners || Outdoor_Unit_Images)) {
            return res.status(400).send('Nothing to change?!...');
        }

        const existingUnit = await prisma.realEstateUnit.findUnique({
            where: { Unit_ID: parseInt(Unit_ID) },
            select: { Initiator: true }
        });

        if (!existingUnit) {
            return res.status(404).send('Real Estate Unit not found.');
        }

        // Safely update Edited_By history
        const editedByList = Array.isArray(existingUnit.Initiator?.Edited_By)
            ? [...existingUnit.Initiator.Edited_By, Edited_By]
            : [Edited_By];

        const updateData = {
            ...(Unit_Type && { Unit_Type }),
            ...(Deed_Owners && { Deed_Owners }),
            ...(Outdoor_Unit_Images && { Outdoor_Unit_Images }),
            Initiator: {
                Created_By: existingUnit.Initiator?.Created_By || null,
                Edited_By: editedByList
            }
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
            return res.status(400).send("Real estate unit ID is required!");
        }
        const deletedUnit = await prisma.realEstateUnit.delete({
            where: { Unit_ID: unitId },
        });
        if (!deletedUnit) {
            return res.status(404).send("Real estate unit not found!");
        }

        return res.status(200).json({
            message: "Real estate unit was deleted successfully!",
            deletedUnit,
        });

    } catch (error) {
        if (error.code === 'P2025') {

            return res.status(404).send("Real estate unit not found!");
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