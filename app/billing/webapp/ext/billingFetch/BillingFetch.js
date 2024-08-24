// sap.ui.define([
//     "sap/m/MessageBox",
//     "sap/ui/core/library",
//     "sap/ui/core/BusyIndicator",
//     "sap/m/MessageToast",
//     "sap/m/Dialog",
//     "sap/m/Button",
//     "sap/m/ButtonType",
//     "sap/m/Text"
// ], function (MessageBox, coreLibrary, BusyIndicator, MessageToast, Dialog, Button, ButtonType, Text) {
//     "use strict";

//     return {
//         fetch: function (oBindingContext, aSelectedContexts) {
//             BusyIndicator.show(0); // Show busy indicator before the AJAX call

//             // Initialize dialog for displaying messages
//             this.fetch = new Dialog({
//                 type: 'Standard',
//                 title: "Fetch Status",
//                 content: new Text({ text: "Fetching total records..." }),
//                 beginButton: new Button({
//                     type: ButtonType.Emphasized,
//                     text: "Close",
//                     press: function () {
//                         this.fetch.close();
//                     }.bind(this)
//                 })
//             });

//             this.fetch.open(); // Open dialog to show fetching status

//             const batchSize = 50; // Define batch size

//             const fetchTotalRecords = async () => {
//                 const serviceUrl = "https://my401292-api.s4hana.cloud.sap/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument/$count";
//                 const username = "USER_NNRG";  // Replace with your username
//                 const password = "FMesUvVB}JhYD9nVbDfRoVcdEffwmVNJJScMzuzx";  // Replace with your password
//                 const authHeader = "Basic " + btoa(username + ":" + password);  // Encode credentials in Base64
                
//                 console.log("Fetching total records from:", serviceUrl); // Log the service URL

//                 return $.ajax({
//                     url: serviceUrl,
//                     type: "GET",
//                     headers: {
//                         "Authorization": authHeader // Set the Authorization header
//                     },
//                     success: function (totalRecords) {
//                         console.log("Total records fetched:", totalRecords); // Log the number of records
//                         return totalRecords;
//                     },
//                     error: function (error) {
//                         console.error("Error fetching total records:", error); // Log error details
//                         MessageBox.error("Failed to fetch total records.");
//                         BusyIndicator.hide();
//                         this.fetch.close();
//                         throw new Error("Failed to fetch total records.");
//                     }.bind(this)
//                 });
//             };            

//             const fetchBatch = async (batchNumber, totalRecords) => {
//                 const batchMessage = `Processing Batch ${batchNumber} of ${totalRecords} records...`;
//                 this.fetch.getContent()[0].setText(batchMessage); // Update dialog text

//                 return $.ajax({
//                     url: `/odata/v4/satinfotech/BillingFetch?batch=${batchNumber}`,
//                     type: "POST",
//                     contentType: "application/json",
//                     success: function (response) {
//                         MessageToast.show(`Batch ${batchNumber} executed successfully.`);
//                     },
//                     error: function (error) {
//                         MessageBox.error(`Failed to execute batch ${batchNumber}.`);
//                         throw new Error(`Failed to execute batch ${batchNumber}.`);
//                     }
//                 });
//             };

//             const fetchAllBatches = async (totalRecords) => {
//                 const totalBatches = Math.ceil(totalRecords / batchSize); // Calculate total batches

//                 for (let i = 1; i <= totalBatches; i++) {
//                     const currentRecord = (i - 1) * batchSize + 1;
//                     await fetchBatch(currentRecord, totalRecords);
//                 }

//                 // After all batches are processed
//                 this.fetch.getContent()[0].setText("All records fetched."); // Update dialog text
//                 BusyIndicator.hide(); // Hide busy indicator
//             };

//             fetchTotalRecords().then((totalRecords) => {
//                 this.fetch.getContent()[0].setText(`Total records: ${totalRecords}. Starting batch fetching...`);
//                 return fetchAllBatches(totalRecords);
//             }).catch(error => {
//                 console.error('Error during batch fetching:', error);
//                 MessageBox.error("An error occurred during batch fetching.");
//                 BusyIndicator.hide(); // Hide busy indicator
//                 this.fetch.close(); // Close dialog on error
//             });
//         }
//     };
// });
sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text"
], function (MessageBox, coreLibrary, BusyIndicator, MessageToast, Dialog, Button, ButtonType, Text) {
    "use strict";

    return {
        fetch: function (oBindingContext, aSelectedContexts) {
            BusyIndicator.show(0); // Show busy indicator before the AJAX call

            // Initialize dialog for displaying messages
            this.fetch = new Dialog({
                type: 'Standard',
                title: "Fetch Status",
                content: new Text({ text: "Fetching total records..." }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Close",
                    press: function () {
                        this.fetch.close();
                    }.bind(this)
                })
            });

            this.fetch.open(); // Open dialog to show fetching status

            const batchSize = 50; // Define batch size

            const fetchTotalRecords = async () => {
                const serviceUrl = "https://my401292-api.s4hana.cloud.sap/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument/$count";
                const username = "USER_NNRG";  // Replace with your username
                const password = "FMesUvVB}JhYD9nVbDfRoVcdEffwmVNJJScMzuzx";  // Replace with your password
                const authHeader = "Basic " + btoa(username + ":" + password);  // Encode credentials in Base64
                
                console.log("Fetching total records from:", serviceUrl); // Log the service URL

                return $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    headers: {
                        "Authorization": authHeader // Set the Authorization header
                    },
                    success: function (totalRecords) {
                        console.log("Total records fetched:", totalRecords); // Log the number of records
                        return totalRecords;
                    },
                    error: function (error) {
                        console.error("Error fetching total records:", error); // Log error details
                        MessageBox.error("Failed to fetch total records.");
                        BusyIndicator.hide();
                        this.fetch.close();
                        throw new Error("Failed to fetch total records.");
                    }.bind(this)
                });
            };

            const fetchBatch = async (batchNumber, totalRecords) => {
                const batchMessage = `Processing Batch ${batchNumber} of ${totalRecords} records...`;
                this.fetch.getContent()[0].setText(batchMessage); // Update dialog text

                return $.ajax({
                    url: `/odata/v4/satinfotech/BillingFetch?batch=${batchNumber}`,
                    type: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        MessageToast.show(`Batch ${batchNumber} executed successfully.`);
                    },
                    error: function (error) {
                        MessageBox.error(`Failed to execute batch ${batchNumber}.`);
                        throw new Error(`Failed to execute batch ${batchNumber}.`);
                    }
                });
            };

            const fetchAllBatches = async (totalRecords) => {
                const totalBatches = Math.ceil(totalRecords / batchSize); // Calculate total batches

                for (let i = 1; i <= totalBatches; i++) {
                    const currentRecord = (i - 1) * batchSize + 1;
                    await fetchBatch(currentRecord, totalRecords);
                }

                // After all batches are processed
                this.fetch.getContent()[0].setText("All records fetched."); // Update dialog text
                // this.fetch.getContent()[0].setText(`Total records: ${totalRecords}`);
                BusyIndicator.hide(); // Hide busy indicator
            };

            fetchTotalRecords().then((totalRecords) => {
                this.fetch.getContent()[0].setText(`Total records: ${totalRecords}. Starting batch fetching...`);
                MessageToast.show(`Total records to process: ${totalRecords}`);  // Display message toast
                return fetchAllBatches(totalRecords);
            }).catch(error => {
                console.error('Error during batch fetching:', error);
                MessageBox.error("An error occurred during batch fetching.");
                BusyIndicator.hide(); // Hide busy indicator
                this.fetch.close(); // Close dialog on error
            });
        }
    };
});
