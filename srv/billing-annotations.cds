using { satinfotech.Billing as Billing } from './invoice';

annotate Billing with @(
    UI.LineItem: [
        { Label: 'Billing Document', Value: BillingDocument },
        { Label: 'Document Category', Value: SDDocumentCategory },
        { Label: 'Sales Organization', Value: SalesOrganization },
        { Label: 'Billing Date', Value: BillingDocumentDate },
        { Label: 'Financial Year', Value: FiscalYear },
        { Label: 'Company Code', Value: CompanyCode }
    ],
    UI.FieldGroup #BillingInformation: {
        $Type: 'UI.FieldGroupType',
        Data: [
            { $Type: 'UI.DataField', Value: BillingDocument },
            { $Type: 'UI.DataField', Value: SDDocumentCategory },
            { $Type: 'UI.DataField', Value: SalesOrganization },
            { $Type: 'UI.DataField', Value: BillingDocumentDate },
            { $Type: 'UI.DataField', Value: FiscalYear },
            { $Type: 'UI.DataField', Value: CompanyCode }
        ]
    },
    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BillingFacet',
            Label: 'Billing Information',
            Target: '@UI.FieldGroup#BillingInformation'
        },
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BillingItemsFacet',
            Label: 'Billing Items',
            Target: 'item/@UI.LineItem'  // Correctly referencing the `item` association
        }
    ]
);

annotate satinfotech.BillingItems with @(
    UI.LineItem: [
        { Label: 'Billing Item', Value: BillingDocumentItem },
        { Label: 'Billing Item Text', Value: BillingDocumentItemText },
        { Label: 'Base Unit', Value: BaseUnit },
        { Label: 'Billing Quantity', Value: BillingQuantityUnit },
        { Label: 'Plant', Value: Plant },
        { Label: 'Storage Location', Value: StorageLocation },
        { Label: 'Billing Document ID', Value: BillingDocument_ID_ID }
    ],
    UI.FieldGroup #BillingItemDetails: {
        $Type: 'UI.FieldGroupType',
        Data: [
            { $Type: 'UI.DataField', Value: BillingDocumentItem },
            { $Type: 'UI.DataField', Value: BillingDocumentItemText },
            { $Type: 'UI.DataField', Value: BaseUnit },
            { $Type: 'UI.DataField', Value: BillingQuantityUnit },
            { $Type: 'UI.DataField', Value: Plant },
            { $Type: 'UI.DataField', Value: StorageLocation },
            { $Type: 'UI.DataField', Value: BillingDocument_ID_ID }
        ]
    },
    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'BillingItemsFacet',
            Label: 'Billing Items',
            Target: '@UI.FieldGroup#BillingItemDetails'  // Correct target reference
        }
    ]
);
