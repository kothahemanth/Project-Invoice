const cds = require('@sap/cds');
const { v4: uuidv4 } = require('uuid');

module.exports = cds.service.impl(async function () {
    const billingapi = await cds.connect.to('API_BILLING_DOCUMENT_SRV');

    // Fetch and upsert data for Billing and BillingItems entities
    this.before('READ', ['Billing', 'BillingItems'], async req => {
        const { Billing, BillingItems } = this.entities;

        try {
            // Fetch Billing documents from the external service
            let billingDocuments = await billingapi.run(SELECT.from('API_BILLING_DOCUMENT_SRV.A_BillingDocument').columns([
                'BillingDocument', 
                'SDDocumentCategory', 
                'SalesOrganization', 
                'BillingDocumentDate', 
                'FiscalYear', 
                'CompanyCode'
            ]).limit(1000));

            // Upsert Billing documents into the local database
            billingDocuments = billingDocuments.map(doc => ({
                ID: uuidv4(),  // Generate UUID for local storage
                ...doc
            }));
            await cds.run(UPSERT.into(Billing).entries(billingDocuments));

            // Fetch Billing Items from the external service
            let billingItems = await billingapi.run(SELECT.from('API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem').columns([
                'BillingDocumentItem',
                'BillingDocumentItemText',
                'BaseUnit',
                'BillingQuantityUnit',
                'Plant',
                'StorageLocation',
                'BillingDocument'
            ]).limit(1000));

            // Upsert Billing Items into the local database
            billingItems = billingItems.map(item => ({
                ID: uuidv4(),  // Generate UUID for local storage
                ...item
            }));
            await cds.run(UPSERT.into(BillingItems).entries(billingItems));

        } catch (error) {
            console.error("Error while fetching and upserting data:", error);
            throw new Error("Data fetching or upserting failed");
        }
    });
});
