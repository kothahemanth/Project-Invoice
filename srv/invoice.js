const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const billingapi = await cds.connect.to("API_BILLING_DOCUMENT_SRV");

  // Status object to keep track of the process
  let fetchStatus = {
    messages: [" Initializing... "],  // Array to keep track of status messages
    completed: false
  };

  // Function to handle the data fetching and upserting logic
  async function fetchAndUpsertBillingData() {
    try {
      const { Billing, BillingItems } = this.entities;

      // Fetch existing records
      const existingBillingDocs = await cds.run(
        SELECT.from(Billing).columns(["BillingDocument"])
      );
      const existingBillingItems = await cds.run(
        SELECT.from(BillingItems).columns([
          "BillingDocument",
          "BillingDocumentItem",
        ])
      );

      const existingBillingDocsMap = new Map(
        existingBillingDocs.map((doc) => [doc.BillingDocument, doc])
      );
      const existingBillingItemsMap = new Map(
        existingBillingItems.map(
          (item) => [`${item.BillingDocument}-${item.BillingDocumentItem}`, item]
        )
      );

      // Fetch the last synchronization date
      const lastsyncdate1 = await cds.run(
        SELECT.one.from(Billing)
          .columns("LastChangeDateTime")
          .orderBy("LastChangeDateTime desc")
      );

      let billlastsyncdatetime;
      if (lastsyncdate1) {
        billlastsyncdatetime = lastsyncdate1.LastChangeDateTime;
      }

      // Count and fetch billing documents based on last sync date
      let countbilldocs;
      let billdocqry = SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocument").columns([
        "BillingDocument",
        "SDDocumentCategory",
        "SalesOrganization",
        "BillingDocumentDate",
        "TotalNetAmount",
        "FiscalYear",
        "CompanyCode",
        "LastChangeDateTime",
      ]);

      if (billlastsyncdatetime) {
        countbilldocs = await billingapi.send({
          method: "GET",
          path: `A_BillingDocument/$count?$filter=LastChangeDateTime gt datetimeoffset'${billlastsyncdatetime}'`,
        });
        billdocqry = billdocqry.where({ LastChangeDateTime: { gt: billlastsyncdatetime } });
      } else {
        countbilldocs = await billingapi.send({ method: "GET", path: "A_BillingDocument/$count" });
      }

      // Process in batches of 50
      let batchSize = 50;
let count = 1;

for (let i = 0; i < countbilldocs; i += batchSize) {
    // Determine the upper limit of the current batch
    let upperLimit = i + batchSize;
    if (upperLimit > countbilldocs) {
        upperLimit = countbilldocs;  // Adjust if the upper limit exceeds the total count
    }

    let billingDocuments = await billingapi.run(billdocqry.limit(batchSize, i));

    // Push a message indicating the current batch range being processed
    fetchStatus.messages.push(`Processing Batch ${count} ( ${i + 1} to ${upperLimit} ) of ${countbilldocs} records`);
    count += 1;
    console.log(fetchStatus.messages[fetchStatus.messages.length - 1]);

    // Filter out existing Billing documents
    const uniqueBillingDocuments = billingDocuments.filter(
        (doc) => !existingBillingDocsMap.has(doc.BillingDocument)
    );
    const billingDocsToUpsert = uniqueBillingDocuments.map((doc) => ({
        ID: uuidv4(),
        ...doc,
    }));

    // UPSERT Billing documents
    if (billingDocsToUpsert.length > 0) {
        await cds.run(UPSERT.into(Billing).entries(billingDocsToUpsert));
    }
}


      // Fetch new Billing items
      let billingItems = await billingapi.run(
        SELECT.from("API_BILLING_DOCUMENT_SRV.A_BillingDocumentItem").columns([
          "BillingDocumentItem",
          "BillingDocumentItemText",
          "BaseUnit",
          "BillingQuantityUnit",
          "Plant",
          "StorageLocation",
          "BillingDocument",
          "NetAmount",
          "TransactionCurrency",
        ])
      );

      // Filter out existing Billing items
      const uniqueBillingItems = billingItems.filter(
        (item) =>
          !existingBillingItemsMap.has(
            `${item.BillingDocument}-${item.BillingDocumentItem}`
          )
      );
      const billingItemsToUpsert = uniqueBillingItems.map((item) => ({
        ID: uuidv4(),
        ...item,
      }));

      // UPSERT Billing items
      if (billingItemsToUpsert.length > 0) {
        await cds.run(UPSERT.into(BillingItems).entries(billingItemsToUpsert));
      }

      // Update status upon completion
      fetchStatus.messages.push("BillingFetching completed successfully");
      fetchStatus.completed = true;
    } catch (error) {
      console.error("Error during read operation:", error);
      fetchStatus.messages.push("Error during BillingFetch operation");
      fetchStatus.completed = true;
      throw error;  // Rethrow to be caught by the calling function
    }
  }

  // Register the BillingFetch handler
  this.on("BillingFetch", async (req) => {
    try {
      fetchStatus = { messages: ["Initializing..."], completed: false }; // Reset status
      await fetchAndUpsertBillingData.call(this);
      console.log("Fetch Status",fetchStatus);
      return true;
    } catch (error) {
      console.error("Error during BillingFetch operation:", error);
      req.error(500, "Error during BillingFetch operation");
    }
  });

  // Register the BillingFetchStatus handler
  this.on("Status", async (req) => {
    console.log(fetchStatus);
    return fetchStatus;
  });

});