using { com.hemanth.satinfotech as db } from '../db/schema';
using {API_BILLING_DOCUMENT_SRV as billingapi} from './external/API_BILLING_DOCUMENT_SRV';

service satinfotech @(requires: 'authenticated-user') {

    // Projection on external OData service
    entity BillingInfo as projection on billingapi.A_BillingDocument {
        BillingDocument,
        SDDocumentCategory,
        SalesOrganization,
        BillingDocumentDate,
        TotalNetAmount,
        FiscalYear,
        CompanyCode,
        
    }

    entity BillingItem as projection on billingapi.A_BillingDocumentItem {
      BillingDocumentItem,
      BillingDocumentItemText,
      BaseUnit,
      BillingQuantityUnit,
      Plant,
      StorageLocation,
      BillingDocument
    }

    // Projection on local database schema
    entity Billing as projection on db.Billing;
}

// Enable draft support for Billing entity
annotate satinfotech.Billing with @odata.draft.enabled;
