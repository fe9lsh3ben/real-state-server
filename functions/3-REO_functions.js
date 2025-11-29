
const { syncTokens } = require('./token_functions');
const SearchType = Object.freeze({
    SEARCH_ONE: 'search_one',
    SEARCH_MANY: 'search_many',
    SEARCH_ON_SCREEN: 'search_on_screen',
    SEARCH_DIRECTION: 'search_direction',
});

const { dbErrorHandler } = require('../libraries/utilities');
const generate_REO = (prisma, Office_Or_User_Status, User_Type) => async (req, res) => {
    let createdOffice;
    try {
        const {
            Commercial_Register,
            Address,
            Office_Name,
            Other,
            Office_Phone,
            Office_Image,
            Office_Banner_Image,
            User_ID,
            TC_ID
        } = req.body;
        console.log('this is user ID:', User_ID)
        // Validate required fields
        if (!TC_ID || !String(TC_ID).includes('OO')) {
            return res.status(400).send({ 'message': 'Terms and Conditions not found.' });
        }

        const missingFields = [];
        if (!Commercial_Register) missingFields.push("Commercial Register");
        if (!Other) missingFields.push("Office Services");
        if (!Address) missingFields.push("Address");
        if (!Office_Name) missingFields.push("Office Name");
        if (!Office_Phone) missingFields.push("Office Phone");
        if (!Office_Image) missingFields.push("Office Image");
        if (!Address) missingFields.push("Address");

        if (missingFields.length > 0) {
            return res.status(400).send(`Missing required fields: ${missingFields.join(", ")}`);
        }

        const takenOffice = await prisma.realEstateOffice.findUnique({
            where: {
                Office_Name: Office_Name
            }

        })

        if (takenOffice) {
            return res.status(400).send({
                "message": `
                Office Name already exists!. 
                If the first office belongs to you, add "Branch number" to the new one name.`});
        }
        console.log(Other)
        const { Region, City, District, Direction, Latitude, Longitude } = Address;

        const dataEntry = {
            TermsAndCondition: { connect: { TC_ID: TC_ID } },
            Commercial_Register,
            Office_Name,
            Office_Phone,
            Other,
            Region,
            City,
            District,
            Direction,
            Latitude,
            Longitude,
            Status: Office_Or_User_Status.ACTIVE,
            Owner: {
                connect: { User_ID: User_ID }
            }
        };


        try {
            var sizeInBytes = Buffer.byteLength(Office_Image, 'base64');
            if (sizeInBytes > 2 * 1024 * 1024) {
                return res.status(400).send({ 'message': "Office Image is more than 2MB" });
            }

            dataEntry.Office_Image = Buffer.from(Office_Image, 'base64');
            if (Office_Banner_Image) {
                sizeInBytes = Buffer.byteLength(Office_Banner_Image, 'base64');
                if (sizeInBytes > 5 * 1024 * 1024) {
                    return res.status(400).send({ 'message': "Office Banner Image is more than 5MB" });
                }
                dataEntry.Office_Banner_Image = Buffer.from(Office_Banner_Image, 'base64');
            }
        }
        catch (e) {
            return res.status(400).send({ 'message': "Office Image or Office Banner Image is not valid" });
        }

        createdOffice = await prisma.realEstateOffice.create({
            data: dataEntry,
            select: {
                Office_ID: true,
                Region,
                City: true,
                District: true,
                Direction: true,
                Latitude: true,
                Longitude: true,
                Office_Name: true,
                Office_Image: true,
                Office_Phone: true,
                Office_Banner_Image: true,
                Other: true,
                Status: true
            }
        });

        const user = await prisma.user.update({
            where: { User_ID: User_ID },
            data: { Role: User_Type.REAL_ESTATE_OFFICE_OWNER },
        });
        console.log('creating');
        return syncTokens(
            req,
            user,
            {
                message: "Real Estate Office was successfully created!",
                office_content: createdOffice,
                note: "Your role became Real Estate Office owner",
            },
            res
        );

    } catch (error) {
        console.error('Error:', error.message);
        // Rollback if partial entity was created
        if (typeof createdOffice !== 'undefined' && createdOffice?.Office_ID) {
            try {
                console.log('Rolling back: deleting partially created office...');
                await prisma.realEstateOffice.findUnique({
                    where: { Office_ID: createdOffice.Office_ID },
                }).then(async (office) => {
                    if (office) {
                        await prisma.realEstateOffice.delete({
                            where: { Office_ID: office.Office_ID },
                        });
                    }
                });
                console.log('Rollback successful.');
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError.message);
            }
        }

        dbErrorHandler(res, error, 'generate REO');
        console.error('Error:', error.message);
    }

};


const get_REO = (prisma) => async (req, res) => {
    try {
        const { Search_Type } = req.body;
        switch (Search_Type) {
            case SearchType.SEARCH_ONE: {
                const Office_ID = parseInt(req.body.Office_ID);
                if (isNaN(Office_ID)) return res.status(400).send({ 'message': "Invalid or missing Office_ID." });
                const selection = {};
                for (const key in req.query) {
                    if (key.startsWith('selection[')) { // this return true, but the fowllowing line is not executed
                        const field = key.match(/selection\[(.+)\]/)[1];
                        selection[field] = req.query[key] === 'true';
                    }
                }

                if (Object.keys(selection).length === 0) {
                    return res.status(400).send({ 'message': "No selection parameter, it is an empty object." });
                }

                const office = await prisma.realEstateOffice.findMany({
                    where: { Office_ID },
                    select:
                        (selection || {})

                });
                if (!office) return res.status(404).send({ 'message': 'Real Estate Office not found.' });

                return res.status(200).send(office);
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

                const offices = await prisma.realEstateOffice.findMany({
                    where: whereClause
                });

                if (!offices.length) return res.status(404).send({ 'message': 'No Real Estate Offices found.' });
                return res.status(200).send(offices);

            }

            case SearchType.SEARCH_ON_SCREEN: {
                const { minLatitude, maxLatitude, minLongitude, maxLongitude } = req.body;

                if (
                    isNaN(minLatitude) || isNaN(maxLatitude) ||
                    isNaN(minLongitude) || isNaN(maxLongitude)
                ) {
                    return res.status(400).send({ 'message': "bounds should be numbers." });
                }

                const offices = await prisma.realEstateOffice.findMany({
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

                if (!offices.length) return res.status(404).send({ 'message': 'No Real Estate Offices found in screen bounds.' });
                return res.status(200).send(offices);
            }


            case SearchType.SEARCH_DIRECTION: {
                const { Direction, City } = req.body;
                if (!Direction) return res.status(400).send({ 'message': "Direction is required." });

                const offices = await prisma.realEstateOffice.findMany({
                    where: {
                        AND: [
                            {
                                Direction: Direction
                            },
                            {
                                City: City
                            },
                        ]

                    }
                });

                if (!offices.length) return res.status(404).send({ 'message': 'No Real Estate Offices found for that direction.' });
                return res.status(200).send(offices);
            }

            default:
                return res.status(400).send({ 'message': 'Invalid Search_Type.' });
        }

    } catch (error) {
        console.log('Error:', error.message);
        return dbErrorHandler(res, error, 'get REO');
    }
};



const update_REO = (prisma) => async (req, res) => {
    try {
        const { Office_ID, Office_Phone, Office_Image, Office_Banner_Image, Remove_Banner, Other, Address } = req.body;
        // Validate required identifier
        if (!Office_ID) {
            return res.status(400).send({ 'message': "Office_ID is required." });
        }

        // Ensure at least one updatable field is present
        if (!(Office_Phone || Office_Image || Office_Banner_Image || Remove_Banner || Other || Address)) {
            return res.status(400).send({ 'message': "At least one field (Office Phone, Office Image, Address, Fal License) must be provided to update." });
        }

        const updateData = {};
        const selection = {};

        if (Office_Phone) {
            updateData.Office_Phone = Office_Phone;
            selection.Office_Phone = true;
        }

        try {
            let sizeInBytes;
            if (Office_Image) {
                sizeInBytes = Buffer.byteLength(Office_Image, 'base64');
                if (sizeInBytes > 2 * 1024 * 1024) {
                    return res.status(400).send({ 'message': "Office Image is more than 2MB" });
                }

                updateData.Office_Image = Buffer.from(Office_Image, 'base64');
            }

            if (Office_Banner_Image) {
                sizeInBytes = Buffer.byteLength(Office_Banner_Image, 'base64');
                if (sizeInBytes > 5 * 1024 * 1024) {
                    return res.status(400).send({ 'message': "Office Banner Image is more than 5MB" });
                }
                updateData.Office_Banner_Image = Buffer.from(Office_Banner_Image, 'base64');
            }
        }
        catch (e) {
            return res.status(400).send({ 'message': "Office Image or Office Banner Image is not valid" });
        }




        if (Office_Image) {
            updateData.Office_Image = Office_Image;
            selection.Office_Image = true;
        }

        if (Office_Banner_Image) {
            updateData.Office_Banner_Image = Office_Banner_Image;
            selection.Office_Banner_Image = true;
        }

        if (Remove_Banner) {
            updateData.Office_Banner_Image = null;
            selection.Office_Banner_Image = true;
        }

        if (Other) {
            updateData.Other = Other;
            selection.Other = true;
        }

        if (Address) {
            const { Region, City, District, Direction, Latitude, Longitude } = req.body.Address;
            updateData.Region = Region;
            updateData.City = City;
            updateData.District = District;
            updateData.Direction = Direction;
            updateData.Latitude = Latitude;
            updateData.Longitude = Longitude;
            selection.Region = true;
            selection.City = true;
            selection.District = true;
            selection.Direction = true;
            selection.Latitude = true;
            selection.Longitude = true;
        }


        const updatedOffice = await prisma.realEstateOffice.update({
            where: { Office_ID: parseInt(Office_ID) },
            data: updateData,
            select: selection
        });

        return res.status(202).json({
            message: 'Real Estate Office updated successfully.',
            data: updatedOffice,
        });

    } catch (error) {
        dbErrorHandler(res, error, 'update_REO');
        console.log('Error:', error.message);
    }
};




module.exports = { generate_REO, get_REO, update_REO }