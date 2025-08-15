
const { dbErrorHandler } = require("../libraries/utilities");


const Party_Particulars = ['GOV_ID', 'Name', 'Signature_OTP', 'Phone_Number'];

const Query_Type = Object.freeze({
    LIST: 'list',
    DETAILED: 'detailed',
});
const generate_Contract = (prisma) => async (req, res) => {
    try {
        const { Office_ID, Parties_Consent, Content, Other } = req.body;

        if (!Office_ID || !Parties_Consent || !Content) {
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
            Content,
            ...(Other && { Other })
        };

        // Create contract in DB
        const createdContract = await prisma.Contract.create({ data: dataEntry });

        return res.status(201).json({
            message: "Contract was successfully created!",
            contract: createdContract
        });

    } catch (error) {
        dbErrorHandler(res, error, 'generate contract');
    }
};


const get_Contract = (prisma) => async (req, res) => {

    try {


        switch (req.body.Query_Type) {

            case Query_Type.LIST:
                const contracts = await prisma.Contract.findMany({
                    where: {
                        Office_ID: parseInt(req.body.Office_ID)
                    }
                });

                if (contracts.length === 0) {
                    return res.status(404).send('No contracts found.');
                }
                return res.status(200).json(contracts);

            case Query_Type.DETAILED:

                const { Contract_ID } = req.body;
                const contract = await prisma.Contract.findUnique({
                    where: {
                        Contract_ID: parseInt(Contract_ID)
                    }
                });

                if (!contract) {
                    return res.status(404).send('Contract not found.');
                }

                return res.status(200).json(contract);
        }
       
    } catch (error) {
        dbErrorHandler(res, error, 'get contract');
    }
}


const delete_Contract = (prisma) => async (req, res) => {

    try {

    } catch (error) {
        dbErrorHandler(res, error, 'delete contract');
    }
}


module.exports = {
    generate_Contract,
    get_Contract,
    update_Contract,
    delete_Contract
}