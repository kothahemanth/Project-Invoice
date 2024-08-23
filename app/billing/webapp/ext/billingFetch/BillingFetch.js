sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/library",
    'sap/ui/core/BusyIndicator',
    "sap/m/MessageToast"

],
function (MessageBox, coreLibrary,BusyIndicator){
    "use strict";
    return {
     
        fetch: function(oBindingContext, aSelectedContexts) {

            
            // Perform an AJAX request to submit the data to the backend
            $.ajax({
                url: "/odata/v4/satinfotech/BillingFetch",
                type: "POST",
                contentType: "application/json",
                success: function(response) {
                    // Handle success response from the backend
                    MessageBox.success("Data submitted successfully.");
                },
                error: function(error) {
                    // Handle error response from the backend
                    MessageBox.error("Error occurred while submitting data.");
                }
            });
           
        },
        
    }
});