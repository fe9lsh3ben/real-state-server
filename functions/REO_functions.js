


const build_up_REO_Function = (prisma) => async (req, res) => {

    try {

        if(!(req.body.CommercialRegister | req.body.ID | req.body.Address | req.body.OfficeName)){
            res.status(400).send(" CommercialRegister & Address & Office name are required!");
            return;
        }
        req.body.OwnerID = req.body.ID;
        const dataEntry = {};

        dataEntry.CommercialRegister = req.body.CommercialRegister;
        dataEntry.OwnerID = req.body.OwnerID;
        dataEntry.Address = req.body.Address;
        dataEntry.OfficeName = req.body.OfficeName;
        if(req.body.OfficeImage){dataEntry.OfficeImage = req.body.OfficeImage}

        prisma.realEstateOffice.create({
            data:{dataEntry}
        }).then((v)=>{
            res.status(201).json({
                "message":"Real Estate Office was successfully created!",
                "office content": v
            })
        });
    } catch (error) {
        res.status(500).send(`Error occured:- ${error.message}`)
    }


}


const update_REO = (prisma) => async (req,res) =>{

    try {
        
    } catch (error) {
        
    }
}


module.exports = {build_up_REO_Function, update_REO}