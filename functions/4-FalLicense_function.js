const { dbErrorHandler } = require("../libraries/utilities");

const generate_FalLicense = (prisma) => async (req, res) => {
  try {
    const {
      License_Number,
      License_Type,
      Owner_ID,
      Issue_Date,
      Expiry_Date,
      Office_ID
    } = req.body;

    // Validate required fields
    if (!License_Number || !License_Type || !Owner_ID || !Issue_Date || !Expiry_Date || !Office_ID) {
      return res.status(400).send(
        "License_Number, License_Type, Owner_ID, Issue_Date, Expiry_Date, and Office_ID are required."
      );
    }

    const createdLicense = await prisma.falLicense.create({
      data: {
        License_Number,
        License_Type,
        Owner_ID,
        Issue_Date: new Date(Issue_Date),
        Expiry_Date: new Date(Expiry_Date),
        Office: {
          connect: { Office_ID: parseInt(Office_ID) }
        }
      }
    });

    return res.status(201).json({
      message: "Fal License was successfully created.",
      license: createdLicense
    });

  } catch (error) {
    dbErrorHandler(res, error, "generate fal license");
    console.error(error.code, error.message);
  }
};

const get_FalLicense = (prisma) => async (req, res) => {
  try {
    const { License_Number, Office_ID } = req.body;

    if (!License_Number && !Office_ID) {
      return res.status(400).send("License_Number or Office_ID is required.");
    }

    let license;

    if (License_Number) {
      license = await prisma.falLicense.findUnique({
        where: { License_Number }
      });
    } else if (Office_ID) {
      license = await prisma.falLicense.findFirst({
        where: { Office_ID: parseInt(Office_ID) }
      });
    }

    if (!license) {
      return res.status(404).send('Fal License not found.');
    }

    return res.status(200).json({ data: license });

  } catch (error) {
    dbErrorHandler(res, error, 'get fal license');
    console.error(error.message);
  }
};


const delete_FalLicense = (prisma) => async (req, res) => {
  try {
    const { License_Number, Office_ID } = req.body;

    if (!License_Number && !Office_ID) {
      return res.status(400).send("License_Number or Office_ID is required!");
    }

    let deleted;

    // Prefer License_Number if both are provided
    if (License_Number) {
      deleted = await prisma.falLicense.delete({
        where: { License_Number },
      }).catch((err) => {
        if (err.code === 'P2025') {
          return null; // Not found
        }
        throw err; // Other error
      });
    } else {
      // Office_ID must not be used with delete directly unless it's unique
      deleted = await prisma.falLicense.deleteMany({
        where: { Office_ID: parseInt(Office_ID) }
      });
      if (deleted.count === 0) deleted = null;
    }

    if (!deleted) {
      return res.status(404).send("Fal License not found.");
    }

    return res.status(200).json({ message: "Fal License was successfully deleted!" });

  } catch (error) {
    dbErrorHandler(res, error, "delete fal license");
  }
};



module.exports = {
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
}