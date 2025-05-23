

const createNewTandC = (prisma, Committed_By) => async (req, res) => {


    var result
    var TC_type
    var TC_ID_type
    try {

        switch (req.body.CommittedBy) {

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
            // console.log("in if")
            result = await prisma.termsAndCondetions.create({
                data: {
                    TC_ID: TC_ID_type + "_000001",
                    Content: [{ "1": req.body.Content }],
                    CommittedBy: TC_type,
                    MadeBy: req.body.MadeBy
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
                    CommittedBy: TC_type,
                    MadeBy: req.body.MadeBy
                }
            })


        }
        res.send(result);

    } catch (err) {

        throw err;

    }


}

const getLastTerms = (prisma) => async (req, res) => {

    try {

        var result
        var TC_ID_type

        switch (req.body.CommittedBy) {

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
            result = v[0];
        })
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {createNewTandC, getLastTerms}