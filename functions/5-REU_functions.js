
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
        const { Search_Type, Unit_ID, Geo_level, Geo_value, Direction, coordinates } = req.query;

        switch (Search_Type) {

            case SearchType.SEARCH_ONE: {
                if (!Unit_ID) {
                    return res.status(400).send("Unit_ID is required for SEARCH_ONE.");
                }

                const unit = await prisma.realEstateUnit.findUnique({
                    where: { Unit_ID: parseInt(Unit_ID) }
                });

                if (!unit) return res.status(404).send('Real Estate Unit not found.');
                return res.status(200).json(unit);
            }

            case SearchType.SEARCH_MANY: {
                if (!Geo_level || !Geo_value) {
                    return res.status(400).send("Geo_level and Geo_value are required for SEARCH_MANY.");
                }

                const units = await prisma.realEstateUnit.findMany({
                    where: {
                        Address: {
                            path: [Geo_level],
                            equals: Geo_value
                        }
                    }
                });

                if (!units.length) return res.status(404).send('No Real Estate Units found.');
                return res.status(200).json(units);
            }

            case SearchType.SEARCH_ON_SCREEN: {
                if (
                    !coordinates ||
                    !coordinates.minAltitude ||
                    !coordinates.maxAltitude ||
                    !coordinates.minLongitude ||
                    !coordinates.maxLongitude
                ) {
                    return res.status(400).send("Complete coordinates are required for SEARCH_ON_SCREEN.");
                }

                const units = await prisma.realEstateUnit.findMany({
                    where: {
                        AND: [
                            {
                                Address: {
                                    path: ['Altitude'],
                                    gte: parseFloat(coordinates.minAltitude),
                                    lte: parseFloat(coordinates.maxAltitude),
                                }
                            },
                            {
                                Address: {
                                    path: ['Longitude'],
                                    gte: parseFloat(coordinates.minLongitude),
                                    lte: parseFloat(coordinates.maxLongitude),
                                }
                            }
                        ]
                    }
                });

                if (!units.length) return res.status(404).send('No Real Estate Units found on screen.');
                return res.status(200).json(units);
            }

            case SearchType.SEARCH_DIRECTION: {
                if (!Direction) {
                    return res.status(400).send("Direction is required for SEARCH_DIRECTION.");
                }

                const units = await prisma.realEstateUnit.findMany({
                    where: {
                        Address: {
                            path: ['Direction'],
                            equals: Direction
                        }
                    }
                });

                if (!units.length) return res.status(404).send('No Real Estate Units found for the given direction.');
                return res.status(200).json(units);
            }

            default:
                return res.status(400).send('Invalid Search_Type.');
        }
    } catch (error) {
        dbErrorHandler(res, error, 'get REU');
        console.error(error.message);
    }
};


const update_REU = (prisma) => async (req, res) => {
  try {
    const {
      Unit_ID,
      Unit_Type,
      Deed_Owners,
      Specifications,
      Outdoor_Unit_Images,
      Edited_By
    } = req.body;

    if (!Unit_ID) {
      return res.status(400).send('Unit_ID is required.');
    }

    // Ensure at least one field to update is present
    if (!(Unit_Type || Deed_Owners || Specifications || Outdoor_Unit_Images)) {
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
      ...(Specifications && { Specifications }),
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
    // Merge query params into body if provided (for flexibility)
    if (req.query) {
      Object.assign(req.body, req.query);
    }

    const unitId = parseInt(req.body.Unit_ID);

    if (!unitId) {
      return res.status(400).send("Real estate unit ID is required!");
    }

    const deletedUnit = await prisma.realEstateUnit.delete({
      where: { Unit_ID: unitId },
    });

    return res.status(200).json({
      message: "Real estate unit was deleted successfully!",
      deletedUnit,
    });

  } catch (error) {
    dbErrorHandler(res, error, "delete real estate unit");
  }
};



module.exports = {
    generate_REU,
    get_REU,
    update_REU,
    delete_REU,
}