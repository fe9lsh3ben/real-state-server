
const { dbErrorHandler } = require("../libraries/utilities");


const Party_Particulars = ['GOV_ID', 'Name', 'Signature_OTP', 'Phone_Number'];

const Query_Type = Object.freeze({
    LIST_FOR_OFFICE: 'list_for_office',
    DETAILED_FOR_OFFICE: 'detailed_for_office',
    LIST_FOR_USER: 'list_for_user',
    DETAILED_FOR_USER: 'detailed_for_user',
});
const generate_Contract = (prisma) => async (req, res) => {

    let createdContract;
    try {
        const { Office_ID, Parties_Consent, Subject, Content, Other } = req.body;

        if (!Office_ID || !Parties_Consent || !Content || !Subject) {
            return res.status(400).send(`
                Office_ID, Parties_Consent, and Content are required!
            `);
        }

        // Validate each party's particulars
        for (const party of Parties_Consent) {
            for (const particular of Object.keys(party)) {
                if (!Party_Particulars.includes(particular)) {
                    return res.status(400).send(`${particular} is not a recognized party particular`);
                }
            }
        }

        // Prepare data entry
        const dataEntry = {
            Office_ID,
            Parties_Consent,
            Subject,
            Content,
            ...(Other && { Other })
        };

        // Create contract in DB
        createdContract = await prisma.Contract.create({ data: dataEntry });

        return res.status(201).json({
            message: "Contract was successfully created!",
            contract: createdContract
        });

    } catch (error) {

        if (typeof createdContract !== "undefined" && createdContract?.Contract_ID) {
            await prisma.Contract.delete({ where: { Contract_ID: createdContract.Contract_ID } });
            console.log('Error occurred and contract was deleted!');
        }
        dbErrorHandler(res, error, 'generate contract');
        console.log(error.message);
    }
};


const get_Contract = (prisma) => async (req, res) => {

    try {

        switch (req.body.Query_Type) {
            case Query_Type.LIST_FOR_OFFICE:
                const contracts = await prisma.Contract.findMany({
                    where: {
                        Office_ID: parseInt(req.body.Office_ID)
                    },
                    select: {
                        Contract_ID: true,
                        Created_At: true,
                        Subject: true
                    }
                });

                if (contracts.length === 0) {
                    return res.status(404).send({'message': 'No contracts found.'});
                }


                return res.status(200).json(contracts);

            case Query_Type.DETAILED_FOR_OFFICE:

                const { Contract_ID } = req.body;
                const contract = await prisma.Contract.findUnique({
                    where: {
                        Contract_ID: parseInt(Contract_ID)
                    }
                });

                if (!contract) {
                    return res.status(404).send({'message': 'Contract not found.'});
                }

                if (contract.Office_ID !== req.body.Office_ID) {
                    return res.status(403).send({'message': 'You are not authorized to access this contract.'});
                }

                return res.status(200).json(contract);

            case Query_Type.LIST_FOR_USER:
                res.status(200).json({});
            case Query_Type.DETAILED_FOR_USER:
                res.status(200).json({});
            default:
                return res.status(400).send({'message': 'Invalid query type.'});
        }

    } catch (error) {
        dbErrorHandler(res, error, 'get contract');
    }
}


const get_Contract_Unregistered = (prisma) => async (req, res) => {
    try {

        if (!req.body.GOV_ID || !req.body.Phone_Number) {
            return res.status(400).send({'message': 'goverment ID and phone number are required.'});
        }

        const contract = await prisma.contract.findMany({
            where: {
                Parties_Consent: {
                    some: {
                        AND: [
                            { path: ["GOV_ID"], equals: req.body.GOV_ID },
                            { path: ["Phone_Number"], equals: req.body.Phone_Number }
                        ]
                    }
                }
            },
            select: {
                Contract_ID: true,
            }
        });

        if (contract.length === 0) {
            return res.status(404).send({'message': 'No contracts found.'});
        }


        return res.status(200).json(contract);

    } catch (error) {
        dbErrorHandler(res, error, 'get contract unregitered');
    }
}


module.exports = {
    generate_Contract,
    get_Contract,
    get_Contract_Unregistered,

}