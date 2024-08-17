const cds = require('@sap/cds');
const { v4: uuidv4 } = require('uuid');

module.exports = cds.service.impl(async function () {
    const billingapi = await cds.connect.to('API_BILLING_DOCUMENT_SRV');

    this.on('READ', 'BillingInfo', async req => {
        req.query.SELECT.columns = [
            'BillingDocument',
            'SDDocumentCategory',
            'SalesOrganization',
            'BillingDocumentDate',
            'TotalNetAmount',
            'FiscalYear',
            'CompanyCode'
        ];

        try {
            const res = await billingapi.run(req.query);
            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });

    this.on('READ', 'BillingItem', async req => {
        req.query.SELECT.columns = [
            'BillingDocumentItem',
            'BillingDocumentItemText',
            'BaseUnit',
            'BillingQuantityUnit',
            'Plant',
            'StorageLocation'
        ];

        try {
            const res = await billingapi.run(req.query);
            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });

    this.before('READ', ['Billing', 'BillingItems'], async req => {
        const { Billing, BillingItems } = this.entities;

        try {
            let billingDocuments = await billingapi.run(
                SELECT.from('API_BILLING_DOCUMENT_SRV.A_BillingDocument')
                .columns([
                    'BillingDocument', 
                    'SDDocumentCategory', 
                    'SalesOrganization', 
                    'BillingDocumentDate', 
                    'TotalNetAmount', 
                    'FiscalYear', 
                    'CompanyCode'
                ])
            );

            billingDocuments = billingDocuments.map(doc => ({
                ID: uuidv4(),
                ...doc
            }));
            await cds.run(UPSERT.into(Billing).entries(billingDocuments));

            let billingItems = await billingapi.run(
                SELECT.from('API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem')
                .columns([
                    'BillingDocumentItem',
                    'BillingDocumentItemText',
                    'BaseUnit',
                    'BillingQuantityUnit',
                    'Plant',
                    'StorageLocation'
                ])
            );

            billingItems = billingItems.map(item => ({
                ID: uuidv4(),
                ...item
            }));
            await cds.run(UPSERT.into(BillingItems).entries(billingItems));

        } catch (error) {
            console.error("Error while fetching and upserting data:", error);
            throw new Error("Data fetching or upserting failed");
        }
    });
});
