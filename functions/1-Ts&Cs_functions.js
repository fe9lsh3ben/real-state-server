const { dbErrorHandler } = require("../libraries/utilities");

const createNewTandC = (prisma, Committed_By) => async (req, res) => {

    let result;
    try {
        let TC_type;
        let TC_ID_type;

        switch (req.body.Committed_By) {
            case "OFFICE_OWNER":
                TC_ID_type = 'OO';
                TC_type = Committed_By.OFFICE_OWNER;
                break;
            case "OFFICE_STAFF":
                TC_ID_type = 'OS';
                TC_type = Committed_By.OFFICE_STAFF;
                break;
            case "BENEFICIARY":
                TC_ID_type = 'B';
                TC_type = Committed_By.BENEFICIARY;
                break;
            case "BUSINESS_BENEFICIARY":
                TC_ID_type = 'BB';
                TC_type = Committed_By.BUSINESS_BENEFICIARY;
                break;
            default:
                return res.status(400).send("Invalid Committed_By value");
        }

        const found = await prisma.TermsAndCondition.findMany({
            where: { TC_ID: { contains: TC_ID_type } },
            orderBy: { TC_ID: 'desc' },
            take: 1,
        });



        if (found.length === 0) {
            console.log(req.body.Content);
            result = await prisma.TermsAndCondition.create({
                
                data: {
                    TC_ID: `${TC_ID_type}_000001`,
                    Content: req.body.Content,
                    Committed_By: TC_type,
                    Made_By: req.body.Made_By,
                },
            });
            console.log(result);
        } else {
            const latestTC = found[0];
            const extractedStrings = latestTC.TC_ID.match(/^([A-Za-z_]+)(\d+)$/);

            if (!extractedStrings) {
                return res.status(500).send("Invalid TC_ID format");
            }

            const prefix = extractedStrings[1];
            const numberPart = extractedStrings[2];
            const incrementedNumber = (parseInt(numberPart, 10) + 1).toString();
            const paddedIncrement = incrementedNumber.padStart(numberPart.length, '0');

            result = await prisma.termsAndCondition.create({
                data: {
                    TC_ID: `${prefix}${paddedIncrement}`,
                    Content: req.body.Content,
                    Committed_By: TC_type,
                    Made_By: req.body.Made_By,
                }, 
            });
        }
        
        return res.send(result);

    } catch (error) {
        if (typeof result !== "undefined" && result?.TC_ID) {
            await prisma.termsAndCondition.delete({ where: { TC_ID: result.TC_ID } });
            console.log('Error occurred and terms were deleted');
        }

        dbErrorHandler(res, error, 'createNewTandC');
        console.error(error.message);
    }
};


const getLastTerms = (prisma) => async (req, res) => {
    try {

        let TC_ID_type;

        switch (req.query.Committed_By) {
            case "OFFICE_OWNER":
                TC_ID_type = 'OO';
                break;
            case "OFFICE_STAFF":
                TC_ID_type = 'OS';
                break;
            case "BENEFICIARY":
                TC_ID_type = 'B';
                break;
            case "BUSINESS_BENEFICIARY":
                TC_ID_type = 'BB';
                break;
            default:
                return res.status(400).send('Invalid Committed_By value');
        }

        const terms = await prisma.TermsAndCondition.findMany({
            where: { TC_ID: { contains: TC_ID_type } },
            orderBy: { TC_ID: 'desc' },
            take: 1,
        });

        if (!terms || terms.length === 0) {
            return res.status(404).send('Terms and Conditions not found.');
        }
        if(req.query.lang === 'en'){
            delete terms.Content.ar;
        }else{
            delete terms.Content.en;
        }
        return res.status(200).send(terms[0]);

    } catch (error) {
        console.error('getLastTerms error:', error);
        dbErrorHandler(res, error, 'getLastTerms');
    }
};


module.exports = { createNewTandC, getLastTerms }