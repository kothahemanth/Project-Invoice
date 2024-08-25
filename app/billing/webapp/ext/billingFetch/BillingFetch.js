sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button"
], function (MessageBox, Dialog, Text, Button) {
    "use strict";
    return {
        invoice: function (oBindingContext, aSelectedContexts) {
            var messageTimeout;

            var oStatusText = new Text({ text: "Starting to fetch documents..." });

            var oDialog = new Dialog({
                title: "Processing",
                content: [oStatusText],
                beginButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                        clearTimeout(messageTimeout);
                    }
                })
            });

            oDialog.open();

            function updateStatus(message, closeDialog = false) {
                oStatusText.setText(message);
                if (messageTimeout) clearTimeout(messageTimeout);

                if (closeDialog) {
                    oDialog.close();
                    MessageBox.success("Fetching done");
                } else {
                    messageTimeout = setTimeout(() => oStatusText.setText(""), 10000);
                }
            }

            function handleStatusResponse(statusResponse) {
                if (statusResponse && typeof statusResponse === 'object' && statusResponse.value) {
                    const messages = statusResponse.value.messages || [];
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
                            url: "/odata/v4/satinfotech/BillingFetchStatus",
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