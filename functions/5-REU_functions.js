 
    
const generate_REU = (prisma) => async (req, res) => {
  
    try {
        if (!(req.body.UnitType && req.body.DeedNumber && req.body.DeedDate && req.body.DeedOwners
            && req.body.AffiliatedOffice && req.body.Initiator && req.body.Address && req.body.UnitImages
            && req.body.Polygon && req.body.Specifications
        )) {
            res.status(400).send(`
                UnitType,DeedNumber,DeedDate,DeedOwners,AffiliatedOffice, 
                Initiator,Address,UnitImages,Polygon,Specifications 
                are required!`);
            return;
        }
        let polygon;
        if(req.body.Polygon){
            polygon = await prisma.realEstateUnit.create_WKT_Polygon(req.body.Polygon)
        }
        const dataEntry = {
            UnitType: req.body.UnitType,
            DeedNumber: req.body.DeedNumber,
            DeedDate: req.body.DeedDate,
            DeedOwners: req.body.DeedOwners,
            AffiliatedOffice: { connect: { Office_ID: parseInt(req.body.Office_ID) } },
            Initiator: req.body.Initiator,
            Address: req.body.Address,
            Polygon: polygon,
            Specifications: req.body.Specifications,
            UnitImages: Buffer.from(req.body.UnitImages, 'base64')
        };



        const createdREUnit = await prisma.realEstateUnit.create({
            data: dataEntry
        });

        res.status(201).json({
            message: "Real Estate Unit was successfully created!",
            "Unit content": createdREUnit
        });
    } catch (error) {

        if (error.code === 'P2002') {
            res.status(400).send('A Real Estate Unit with this Deed number already exists.');
        } else {
            res.status(500).send(`Error occurred: ${error.message}`);
        }

    }


}
 
const get_REU = (prisma) => async (req, res) => {

    try {
        
    } catch (error) {
        
    }
}
 
const update_REU = (prisma) => async (req, res) => {

    try {
        
    } catch (error) {
        
    }
}
 
const delete_REU = (prisma) => async (req, res) => {

    try {
        
    } catch (error) {
        
    }
}
    

module.exports = { generate_REU,
    get_REU,
    update_REU,
    delete_REU, }