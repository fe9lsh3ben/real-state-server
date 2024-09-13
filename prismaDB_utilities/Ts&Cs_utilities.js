


const find_last_termsANDconditions = async (prisma, Committed_By, req) => {

   
    var result 
    var TC_type
    var TC_ID_type
    try {
        
        switch(req.body.CommetedBy){

        case("OFFICE_OWNER"):
            TC_ID_type = 'OO'
            TC_type = Committed_By.OFFICE_OWNER
        break;

        case("OFFICE_STAFF"):
            TC_ID_type = 'OS'
            TC_type = Committed_By.OFFICE_STAFF
        break;

        case("BENEFICIARY"):
            TC_ID_type = 'B'
            TC_type = Committed_By.BENEFICIARY
        break;

        case("BUSINESS_BENEFICIARY"):
            TC_ID_type = 'BB'
            TC_type = Committed_By.BUSINESS_BENEFICIARY
        break;
        
    
    
    }
        
        await prisma.termsAndCondetions.findMany({
            where:{ID: {contains: TC_ID_type}},orderBy: { ID: 'desc'},take: 1,
        }).then((v) => {
            result = v[0];
        })


        if (result == undefined) {
            // console.log("in if")
            result = await prisma.termsAndCondetions.create({
                data:{ ID: TC_ID_type + "_000001", Content:[{"1":req.body.Content}],
                CommetedBy: TC_type,
                MadeBy: req.body.MadeBy}
            })
        }else{

        }

        return result;

    } catch (err) {
        
        throw err;
        
    }
    
      
    
   
    
  
   
   
}



module.exports = {find_last_termsANDconditions}