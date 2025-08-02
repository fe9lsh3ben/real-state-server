const { dbErrorHandler } = require("../libraries/utilities");

const generate_FalLicense = (prisma) => async (req, res) => {

    try {
        if (!(req.body.License_Number && 
            req.body.License_Type &&
            req.body.Owner_ID &&
            req.body.Issue_Date &&
            req.body.Expiry_Date &&
            req.body.Expiry_Date && 
            req.body.Office_ID)) {
            res.status(400).send(`
            Fal License Number,
            License Type,
            Owner ID,
            Issue Date,
            Expiry Date,
            Office ID are required!
            `);
            return;
        }
        await prisma.falLicense.create({
            data: {
                License_Number: req.body.License_Number,
                License_Type: req.body.License_Type,
                Owner_ID: req.body.Owner_ID,
                Issue_Date: new Date(req.body.Issue_Date),
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
     try {
        if (!(req.body.License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if (req.body.License_Number) {
            await prisma.falLicense.findUnique({
                where: {
                    License_Number: req.body.License_Number,
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
        if (!(req.body.License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if (req.body.License_Number) {
            await prisma.falLicense.delete({
                where: {
                    License_Number: req.body.License_Number,
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