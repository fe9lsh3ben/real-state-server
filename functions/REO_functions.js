


const build_up_REO_Function = (prisma) => async (req, res) => {
    try {
      if (!(req.body.CommercialRegister && req.body.User_ID && req.body.Address && req.body.OfficeName)) {
        res.status(400).send("CommercialRegister, Owner_ID, Address, and OfficeName are required!");
        return;
      }
  
      const dataEntry = {
        CommercialRegister: req.body.CommercialRegister,
        Owner: { connect: { User_ID: parseInt(req.body.User_ID) } },
        OfficeName: req.body.OfficeName,
        Address: req.body.Address,
        Status: req.body.Status || 'ACTIVE', // Assuming a default status
      };
  
      if (req.body.OfficeImage) {
        dataEntry.OfficeImage = Buffer.from(req.body.OfficeImage, 'base64'); // Convert to Bytes
      }
  
      const createdOffice = await prisma.realEstateOffice.create({
        data: dataEntry
      });
  
      res.status(201).json({
        message: "Real Estate Office was successfully created!",
        "office content": createdOffice
      });
    } catch (error) {
      if (error.code === 'P2002') {
        res.status(400).send('A Real Estate Office with this Owner already exists.');
      } else {
        res.status(500).send(`Error occurred: ${error.message}`);
      }
    }
  };
  const update_REO = (prisma) => async (req, res) => {
    try {
      if (!req.body.Office_ID) {
        res.status(400).send("Real Estate Office ID is required!");
        return;
      }
      
      if(!(req.body.CommercialRegister ||
        req.body.OfficeName || 
        req.body.Address || 
        req.body.OfficeImage)) {
            res.status(400).send('no data sent to change!')
            return}; 

      const Office_ID = parseInt(req.body.Office_ID);
      const updateData = {};
  
      if (req.body.CommercialRegister) updateData.CommercialRegister = req.body.CommercialRegister;
      if (req.body.OfficeName) updateData.OfficeName = req.body.OfficeName;
      if (req.body.Address) updateData.Address = req.body.Address;
      if (req.body.OfficeImage) updateData.OfficeImage = Buffer.from(req.body.OfficeImage, 'base64');
  
      const updatedOffice = await prisma.realEstateOffice.update({
        where: { Office_ID: Office_ID },
        data: updateData
      });
  
      res.status(200).json({
        message: "Real Estate Office was successfully updated!",
        "updated office content": updatedOffice
      });
    } catch (error) {
      if (error.code === 'P2025') {
        res.status(404).send('Real Estate Office not found.');
      } else {
        res.status(500).send(`Error occurred: ${error.message}`);
      }
    }
  };


module.exports = {build_up_REO_Function, update_REO}