const { dbErrorHandler } = require("../libraries/utilities");

const generate_FalLicense = (prisma) => async (req, res) => {

    try {
        if (!(req.body.Fal_License_Number && req.body.Expiry_Date && req.body.Office_ID)) {
            res.status(400).send("Fal License Number, and expiry date are required!");
            return;
        }
        await prisma.falLicense.create({
            data: {
                Fal_License_Number: req.body.Fal_License_Number,
                Expiry_Date: new Date(req.body.Expiry_Date),
                Office: { connect: { Office_ID: parseInt(req.body.Office_ID) } }
            }
        }).then((v) => {
            res.status(201).json({
                message: "Fal License was successfully created!",
                "License content": v
            });
        });


    } catch (error) {
        dbErrorHandler(res, error, `generate fal license`);
        console.log(error.code);
        console.log(error.message);
    }
}

const get_FalLicense = (prisma) => async (req, res) => {
    console.log(req.body);
    try {
        if (!(req.body.Fal_License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if (req.body.Fal_License_Number) {
            await prisma.falLicense.findUnique({
                where: {
                    Fal_License_Number: req.body.Fal_License_Number,
                }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).send(v);

            })
            return;
        }

        if (req.body.Office_ID) {
            await prisma.falLicense.findUnique({
                where: {
                    Office_ID: parseInt(req.body.Office_ID)
                }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({ "Data": v });
            })
            return;
        }

    } catch (error) {

        dbErrorHandler(res, error, 'get fal license');
        console.log(error.message);
    }
}


const delete_FalLicense = (prisma) => async (req, res) => {

    try {
        if (!(req.body.Fal_License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if (req.body.Fal_License_Number) {
            await prisma.falLicense.delete({
                where: {
                    Fal_License_Number: req.body.Fal_License_Number,
                }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({ message: 'Fal License was successfully deleted!' });
                
            });
            return;
        }

        if (req.body.Office_ID) {
            await prisma.falLicense.delete({
                where: {
                    Office_ID: parseInt(req.body.Office_ID)
                }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({ message: 'Fal License was successfully deleted!' }); return;
            });
            return;
        }

    } catch (error) {

        dbErrorHandler(res, error, 'delete fal license');
    }
}


module.exports = {
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
}