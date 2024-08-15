const cds = require('@sap/cds');

module.exports = cds.service.impl(async function(){
    const billingapi = await cds.connect.to('API_BILLING_DOCUMENT_SRV');

    this.on('READ', 'BillingInfo', async req => {
        
        // Adjust the query to correctly expand the CompanyCode and include all necessary columns
        req.query.SELECT.columns = [
            { ref: ['BillingDocument'] },
            { ref: ['SDDocumentCategory'] },
            { ref: ['SalesOrganization'] },
            { ref: ['BillingDocumentDate'] },
            { ref: ['TotalNetAmount'] },
            { ref: ['FiscalYear'] },
            {
                ref: ['CompanyCode'],
            }
        ];

        try {
            let res = await billingapi.run(req.query);

            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });

    this.on('READ', 'BillingItem', async req => {
        
        // Adjust the query to correctly expand the CompanyCode and include all necessary columns
        req.query.SELECT.columns = [
            { ref: ['BillingDocumentItem'] },
            { ref: ['BillingDocumentItemText'] },
            { ref: ['BaseUnit'] },
            { ref: ['BillingQuantityUnit'] },
            { ref: ['Plant'] },
            { ref: ['StorageLocation'] },
            { ref: ['BillingDocument'] },
        ];

        try {
            let res = await billingapi.run(req.query);
            
            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });
});
