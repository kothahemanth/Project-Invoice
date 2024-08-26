sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button"
], function (MessageBox, Dialog, Text, Button) {
    "use strict";
    return {
        fetch: function (oBindingContext, aSelectedContexts) {
            var messageTimeout;

            var oStatusText = new Text({ text: " Starting to Fetch Billing Docs... " });

            var oDialog = new Dialog({
                title: "Fetching Details",
                content: [oStatusText],
                beginButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                        clearTimeout(messageTimeout);
                    }
                }),
                endButton: new Button({ // Adding the OK button here
                    text: "OK",
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            oDialog.open();

            function updateStatus(message, closeDialog = false) {
                oStatusText.setText(message);
                if (messageTimeout) clearTimeout(messageTimeout);

                if (closeDialog) {
                    oDialog.close();
                    MessageBox.success("Fetching Successfully");
                } else {
                    messageTimeout = setTimeout(() => oStatusText.setText(""), 10000);
                }
            }

            function handleStatusResponse(statusResponse) {
                if (statusResponse && typeof statusResponse === 'object' && statusResponse.value) {
                    const messages = statusResponse.value.messages || [];
                    const totalRecords = statusResponse.value.totalRecords || 0; // Assuming `totalRecords` is part of the response
                    updateStatus(`Total Records: ${totalRecords}`);

                    messages.forEach((msg, i) => {
                        setTimeout(() => {
                            if (msg === "BillingFetch completed successfully") {
                                updateStatus(msg, true);
                            } else {
                                updateStatus(msg);
                            }
                        }, i * 5000);
                    });
                } else {
                    updateStatus("Unexpected status response format.", true);
                }
            }

            $.ajax({
                url: "/odata/v4/satinfotech/BillingFetch",
                type: "POST",
                contentType: "application/json",
                success: function () {
                    // Poll only once after 5 seconds
                    setTimeout(() => {
                        $.ajax({
                            url: "/odata/v4/satinfotech/Status",
                            type: "POST",
                            contentType: "application/json",
                            success: handleStatusResponse,
                            error: function () {
                                updateStatus("Error during polling.", true);
                            }
                        });
                    }, 5000);
                },
                error: function () {
                    updateStatus("Error starting the fetch operation.", true);
                }
            });
        }
    };
});
