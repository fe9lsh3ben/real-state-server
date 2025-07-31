

const createNewTandC = (prisma, Committed_By) => async (req, res) => {


    var result
    var TC_type
    var TC_ID_type
    try {
        
        switch (req.body.Committed_By) {

            case ("OFFICE_OWNER"):
                TC_ID_type = 'OO'
                TC_type = Committed_By.OFFICE_OWNER
                break;

            case ("OFFICE_STAFF"):
                TC_ID_type = 'OS'
                TC_type = Committed_By.OFFICE_STAFF
                break;

            case ("BENEFICIARY"):
                TC_ID_type = 'B'
                TC_type = Committed_By.BENEFICIARY
                break;

            case ("BUSINESS_BENEFICIARY"):
                TC_ID_type = 'BB'
                TC_type = Committed_By.BUSINESS_BENEFICIARY
                break;



        }
        await prisma.termsAndCondetions.findMany({
            where: { TC_ID: { contains: TC_ID_type } }, orderBy: { TC_ID: 'desc' }, take: 1,
        }).then((v) => {
            result = v[0];
        })


        if (result == undefined) {
            result = await prisma.termsAndCondetions.create({
                data: {
                    TC_ID: TC_ID_type + "_000001",
                    Content: [{ "1": req.body.Content }],
                    Committed_By: TC_type,
                    Made_By: req.body.Made_By
                }
            })
        } else {

            const extractedStrings = result.TC_ID.match(/^([A-Za-z_]+)(\d+)$/);
           
            const IDnumberedPart = extractedStrings[2]
            const incremented = (parseInt(extractedStrings[2], 10) + 1).toString()
            const paddedIncrement = incremented.padStart(IDnumberedPart.length, '0')

            result = await prisma.termsAndCondetions.create({
                data: {
                    TC_ID: `${extractedStrings[1]}${paddedIncrement}`,
                    Content: [{ "1": req.body.Content }],
                    Committed_By: TC_type,
                    Made_By: req.body.Made_By
                }
            })


        }
        res.send(result);

    } catch (error) {

       dbErrorHandler(res, error,'createNewTandC');

    }


}

const getLastTerms = (prisma) => async (req, res) => {

    try {

        var result
        var TC_ID_type

        switch (req.body.Committed_By) {

            case ("OFFICE_OWNER"):
                TC_ID_type = 'OO'
                break;

            case ("OFFICE_STAFF"):
                TC_ID_type = 'OS'
                break;

            case ("BENEFICIARY"):
                TC_ID_type = 'B'
                break;

            case ("BUSINESS_BENEFICIARY"):
                TC_ID_type = 'BB'
                break;



        }

        await prisma.termsAndCondetions.findMany({
            where: { TC_ID: { contains: TC_ID_type } }, orderBy: { TC_ID: 'desc' }, take: 1,
        }).then((v) => {
            if (!v) res.status(404).send('Terms and Condetions not found.');
            res.status(200).send(v);
        })
         
    } catch (error) {
        dbErrorHandler(res, error, 'getLastTerms');
    }
}

module.exports = {createNewTandC, getLastTerms}