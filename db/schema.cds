namespace com.hemanth.satinfotech;

using { managed, cuid } from '@sap/cds/common';

entity Billing : managed, cuid {

    @title: 'Billing Document'
    key BillingDocument: String(10);
    @title: 'Document Category'
    SDDocumentCategory: String(4);
    @title: 'Sales Organization'
    SalesOrganization: String(4);
    @title: 'Billing Date'
    BillingDocumentDate: Date;
    @title: 'Financial Year'
    FiscalYear: String(4);
    @title: 'Company Code'
    CompanyCode: String(4);

    BillingItems : Composition of many BillingItems on BillingItems.BillingDocument_ID = $self;
}

entity BillingItems : cuid, managed {

    BillingDocument_ID: Association to Billing;
    @title: 'Billing Item'
    BillingDocumentItem: String(6);
    @title: 'Billing Item Text'
    BillingDocumentItemText: String(40);
    @title: 'Base Unit'
    BaseUnit: String(3);
    @title: 'Billing Quantity Unit'
    BillingQuantityUnit: String(3);
    @title: 'Plant'
    Plant: String(4);
    @title: 'Storage Location'
    StorageLocation: String(4);
}


