const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const billingapi = await cds.connect.to('API_BILLING_DOCUMENT_SRV');

    this.on('READ', 'BillingInfo', async (req) => {
        
            return await billingapi.run(req.query)
        
    });
});
