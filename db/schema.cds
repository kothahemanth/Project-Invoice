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

    item : Composition of many BillingItems on item.BillingDocument_ID = $self;
}

entity BillingItems : cuid, managed {

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

    BillingDocument_ID : Association to one Billing;
}


