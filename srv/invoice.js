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
            'StorageLocation',
            'BillingDocument'
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
            // Fetch existing Billing documents from the local database
            const existingBillingDocs = await cds.run(SELECT.from(Billing).columns(['BillingDocument']));
            const existingBillingItems = await cds.run(SELECT.from(BillingItems).columns(['BillingDocument', 'BillingDocumentItem']));

            const existingBillingDocsMap = new Map(existingBillingDocs.map(doc => [doc.BillingDocument, doc]));
            const existingBillingItemsMap = new Map(existingBillingItems.map(item => [`${item.BillingDocument}-${item.BillingDocumentItem}`, item]));

            // Fetch new Billing documents from the external service
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

            // Filter out existing Billing documents
            const uniqueBillingDocuments = billingDocuments.filter(doc => !existingBillingDocsMap.has(doc.BillingDocument));
            const billingDocsToUpsert = uniqueBillingDocuments.map(doc => ({ ID: uuidv4(), ...doc }));

            // Perform the UPSERT operation for Billing documents
            if (billingDocsToUpsert.length > 0) {
                await cds.run(UPSERT.into(Billing).entries(billingDocsToUpsert));
            }

            // Fetch new Billing items from the external service
            let billingItems = await billingapi.run(
                SELECT.from('API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem')
                .columns([
                    'BillingDocumentItem',
                    'BillingDocumentItemText',
                    'BaseUnit',
                    'BillingQuantityUnit',
                    'Plant',
                    'StorageLocation',
                    'BillingDocument'
                ])
            );

            // Filter out existing Billing items
            const uniqueBillingItems = billingItems.filter(item => !existingBillingItemsMap.has(`${item.BillingDocument}-${item.BillingDocumentItem}`));
            const billingItemsToUpsert = uniqueBillingItems.map(item => ({ ID: uuidv4(), ...item }));

            // Perform the UPSERT operation for Billing items
            if (billingItemsToUpsert.length > 0) {
                await cds.run(UPSERT.into(BillingItems).entries(billingItemsToUpsert));
            }

        } catch (error) {
            console.error("Error while fetching and upserting data:", error);
            throw new Error("Data fetching or upserting failed");
        }
    });
});
