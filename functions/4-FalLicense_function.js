

const generate_FalLicense = (prisma) => async (req, res) => {
    
    try {
        if (!(req.body.Fal_License_Number && req.body.Expiry_Date && req.body.Office_ID)) {
            res.status(400).send("Fal License Number, and expiry date are required!");
            return;
        }

        await prisma.falLicense.create({
            data: {
                Fal_License_Number: req.body.Fal_License_Number,
                Expiry_Date: req.body.Expiry_Date,
                RealEstateOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } }
            }
        }).then((v) => {
            res.status(201).json({
                message: "Fal License was successfully created!",
                "License content": v
            });
        });

         
    } catch (error) {
        if (error.code === 'P2002') {
            res.status(400).send('the fal license already exists.');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }
    }
}

const get_FalLicense = (prisma) => async (req, res) => {
    
    try {
        if (!(req.body.Fal_License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if(req.body.Fal_License_Number){
            await prisma.falLicense.findUnique({
            where: {
                Fal_License_Number: req.body.Fal_License_Number,
            }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).send(v);
                return;
            })
        }

        if(req.body.Office_ID){
            await prisma.falLicense.findUnique({
            where: {
                RealEstateOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } }
            }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({"Data": v });
                return;
            })
        }
        
    } catch (error) {

        res.status(500).send(`Error occurred: ${error.message}`);
    }
}


const delete_FalLicense = (prisma) => async (req, res) => {
    
    try {
        if (!(req.body.Fal_License_Number || req.body.Office_ID)) {
            res.status(400).send("Fal License Number, or Office ID is required!");
            return;
        }
        if(req.body.Fal_License_Number){
            await prisma.falLicense.delete({
            where: {
                Fal_License_Number: req.body.Fal_License_Number,
            }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({ message: 'Fal License was successfully deleted!'});
                return;
            })
        }

        if(req.body.Office_ID){
            await prisma.falLicense.delete({
            where: {
                RealEstateOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } }
            }
            }).then((v) => {
                if (!v) res.status(404).send('Fal License not found.');
                res.status(200).json({ message: 'Fal License was successfully deleted!'});                return;
            })
        }
        
    } catch (error) {
              
        if (err.code === 'P2025') {

            res.status(404).send("License not found");

        }else if (err.code === 'P2002'){
           
            res.status(400).send('This License already exists.');

        } else {
            res.status(500).send("Internal error");
        }
    }
}


module.exports ={
    generate_FalLicense,
    get_FalLicense,
    delete_FalLicense
}