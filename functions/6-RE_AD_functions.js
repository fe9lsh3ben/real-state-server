

const { dbErrorHandler } = require('../libraries/utilities');

const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});

const validAdTypes = ["RENT", "SELL", "INVESTMENT", "SERVICE"];
const validUnitTypes = [
    "LAND", "BAUILDING", "APARTMENT", "VILLA", "STORE", "FARM",
    "CORRAL", "STORAGE", "OFFICE", "SHOWROOM", "OTHER"
];



const generate_READ = (prisma) => async (req, res) => {
  try {
    const {
      Initiator,
      AD_Content,
      AD_Type,
      AD_Unit_Type,
      Office_ID,
      Unit_ID,
      Fal_License_Number,
      Expiry_Date
    } = req.body;

    // Check required fields
    const missingFields = [];
    if (!Initiator) missingFields.push("Initiator");
    if (!AD_Content) missingFields.push("AD_Content");
    if (!AD_Type) missingFields.push("AD_Type");
    if (!AD_Unit_Type) missingFields.push("AD_Unit_Type");
    if (!Office_ID) missingFields.push("Office_ID");
    if (!Unit_ID) missingFields.push("Unit_ID");
    if (!Fal_License_Number) missingFields.push("Fal_License_Number");

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
      Initiator: { connect: { Office_ID: parseInt(Office_ID) } },
      RealEstate: { connect: { Unit_ID: parseInt(Unit_ID) } },
      AD_Type,
      AD_Unit_Type,
      AD_Content,
      AD_Started_At: new Date(),
      AD_Expiry: Expiry_Date ? new Date(Expiry_Date) : new Date("2026-12-31"),
      Hedden: false,
    };

    const createdAD = await prisma.realEStateAD.create({
      data: dataEntry,
    });

    return res.status(201).json({
      message: "Real Estate AD was successfully created!",
      data: createdAD,
    });

  } catch (error) {
    dbErrorHandler(res, error, "generate real estate ad");
    console.error(error.message);
  }
};



const get_READ = (prisma) => async (req, res) => {
  try {
    const { searchType, AD_ID, city, coordinates, direction } = req.body;

    switch (searchType) {

      case SearchType.SEARCH_ONE: {
        const ad = await prisma.realEStateAD.findUnique({
          where: { AD_ID: parseInt(AD_ID) }
        });
        if (!ad) return res.status(404).send('Real Estate AD not found.');
        return res.status(200).json(ad);
      }

      case SearchType.SEARCH_MANY: {
        if (!city) return res.status(400).send("City is required for SEARCH_MANY.");

        const ads = await prisma.realEStateAD.findMany({
          where: {
            RealEstate: {
              Address: {
                path: ['City'],
                equals: city
              }
            }
          }
        });

        if (!ads || ads.length === 0) return res.status(404).send('Real Estate ADs not found.');
        return res.status(200).json(ads);
      }

      case SearchType.SEARCH_ON_SCREEN: {
        if (!coordinates ||
            !coordinates.minAltitude || !coordinates.maxAltitude ||
            !coordinates.minLongitude || !coordinates.maxLongitude) {
          return res.status(400).send("Missing or incomplete coordinates.");
        }

        const ads = await prisma.realEStateAD.findMany({
          where: {
            AND: [
              {
                RealEstate: {
                  Address: {
                    path: ['Altitude'],
                    gte: parseFloat(coordinates.minAltitude),
                    lte: parseFloat(coordinates.maxAltitude)
                  }
                }
              },
              {
                RealEstate: {
                  Address: {
                    path: ['Longitude'],
                    gte: parseFloat(coordinates.minLongitude),
                    lte: parseFloat(coordinates.maxLongitude)
                  }
                }
              }
            ]
          }
        });

        if (!ads || ads.length === 0) return res.status(404).send('Real Estate ADs not found on screen.');
        return res.status(200).json(ads);
      }

      case SearchType.SEARCH_DIRECTION: {
        if (!direction) return res.status(400).send("Direction is required.");

        const ads = await prisma.realEStateAD.findMany({
          where: {
            RealEstate: {
              Address: {
                path: ['Direction'],
                equals: direction
              }
            }
          }
        });

        if (!ads || ads.length === 0) return res.status(404).send('No Real Estate ADs found in that direction.');
        return res.status(200).json(ads);
      }

      default:
        return res.status(400).send('Invalid search type.');
    }

  } catch (error) {
    dbErrorHandler(res, error, 'get real estate ad');
    console.error(error.message);
  }
};


const edit_REU = (prisma) => async (req, res) => {
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