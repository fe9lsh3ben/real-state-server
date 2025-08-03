
const { syncTokens } = require('./token_functions');
const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});

const { dbErrorHandler } = require('../libraries/utilities');
const generate_REO = (prisma, Office_Or_User_Status, User_Type) => async (req, res) => {
  try {
    const {
      Commercial_Register,
      Address,
      Office_Name,
      Office_Phone,
      Office_Image,
      Fal_License_Number,
      User_ID
    } = req.body;

    // Validate required fields
    if (!Commercial_Register || !Address || !Office_Name || !User_ID) {
      return res.status(400).send("Commercial Register, Address, Office Name, and User_ID are required!");
    }

    const userId = parseInt(User_ID);
    const dataEntry = {
      Commercial_Register,
      Office_Name,
      Office_Phone,
      Address,
      Status: Office_Or_User_Status.ACTIVE,
      Owner: { connect: { User_ID: userId } }
    };

    if (Fal_License_Number) {
      dataEntry.Fal_License = { connect: { Fal_License_Number } };
    }

    if (Office_Image) {
      dataEntry.Office_Image = Buffer.from(Office_Image, 'base64');
    }

    const createdOffice = await prisma.realEstateOffice.create({ data: dataEntry });

    const user = await prisma.user.update({
      where: { User_ID: userId },
      data: { Role: User_Type.REAL_ESTATE_OFFICE_OWNER },
    });

    return syncTokens(
      user,
      {
        message: "Real Estate Office was successfully created!",
        office_content: createdOffice,
        note: "Your role became Real Estate Office owner",
      },
      res
    );

  } catch (error) {
    dbErrorHandler(res, error, 'generate REO');
  }
};


const get_REO = (prisma) => async (req, res) => {
  try {
    const { Search_Type } = req.query;

    switch (Search_Type) {
      case SearchType.SEARCH_ONE: {
        const Office_ID = parseInt(req.query.Office_ID);
        if (isNaN(Office_ID)) return res.status(400).send("Invalid or missing Office_ID.");

        const office = await prisma.realEstateOffice.findUnique({ where: { Office_ID } });
        if (!office) return res.status(404).send('Real Estate Office not found.');

        return res.status(200).send(office);
      }

      case SearchType.SEARCH_MANY: {
        const { Geo_level, Geo_value } = req.query;
        if (!Geo_level || !Geo_value) {
          return res.status(400).send("Missing Geo_level or Geo_value.");
        }

        const offices = await prisma.realEstateOffice.findMany({
          where: {
            Address: {
              path: [Geo_level],
              equals: Geo_value
            }
          }
        });

        if (!offices.length) return res.status(404).send('No Real Estate Offices found.');
        return res.status(200).send(offices);
      }

      case SearchType.SEARCH_ON_SCREEN: {
        const coords = req.query.coordinates;
        if (
          !coords ||
          isNaN(coords.minAltitude) || isNaN(coords.maxAltitude) ||
          isNaN(coords.minLongitude) || isNaN(coords.maxLongitude)
        ) {
          return res.status(400).send("Missing or invalid coordinates.");
        }

        const offices = await prisma.realEstateOffice.findMany({
          where: {
            AND: [
              {
                Address: {
                  path: ['Altitude'],
                  gte: parseFloat(coords.minAltitude),
                  lte: parseFloat(coords.maxAltitude),
                },
              },
              {
                Address: {
                  path: ['Longitude'],
                  gte: parseFloat(coords.minLongitude),
                  lte: parseFloat(coords.maxLongitude),
                },
              },
            ],
          },
        });

        if (!offices.length) return res.status(404).send('No Real Estate Offices found in screen bounds.');
        return res.status(200).send(offices);
      }

      case SearchType.SEARCH_DIRECTION: {
        const { Direction } = req.query;
        if (!Direction) return res.status(400).send("Direction is required.");

        const offices = await prisma.realEstateOffice.findMany({
          where: {
            Address: {
              path: ['Direction'],
              equals: Direction
            }
          }
        });

        if (!offices.length) return res.status(404).send('No Real Estate Offices found for that direction.');
        return res.status(200).send(offices);
      }

      default:
        return res.status(400).send('Invalid Search_Type.');
    }

  } catch (error) {
    return dbErrorHandler(res, error, 'get REO');
  }
};


const update_REO = (prisma) => async (req, res) => {
  try {
    const { Office_ID, Office_Phone, Office_Image, Address } = req.body;

    // Validate required identifier
    if (!Office_ID) {
      return res.status(400).send("Office_ID is required.");
    }

    // Ensure at least one updatable field is present
    if (!(Office_Phone || Office_Image || Address)) {
      return res.status(400).send("At least one field (Office Phone, Office Image, Address) must be provided to update.");
    }

    const updateData = {};
    if (Office_Phone) updateData.Office_Phone = Office_Phone;
    if (Office_Image) updateData.Office_Image = Office_Image;
    if (Address) updateData.Address = Address;

    const updatedOffice = await prisma.realEstateOffice.update({
      where: { Office_ID: parseInt(Office_ID) },
      data: updateData,
    });

    return res.status(202).json({
      message: 'Real Estate Office updated successfully.',
      data: updatedOffice,
    });

  } catch (error) {
    dbErrorHandler(res, error, 'update_REO');
  }
};




module.exports = { generate_REO, get_REO, update_REO }