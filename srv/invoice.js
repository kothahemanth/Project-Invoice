const cds = require('@sap/cds');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

module.exports = cds.service.impl(async function () {
    const billingapi = await cds.connect.to('API_BILLING_DOCUMENT_SRV');

    // Define the absolute path for the SQLite database
    const dbPath = path.resolve('db.sqlite');

    // Verify the directory exists
    if (!fs.existsSync(path.dirname(dbPath))) {
        console.error('Directory does not exist:', path.dirname(dbPath));
        process.exit(1); // Exit if directory does not exist
    }

    // Initialize SQLite database connection
    const sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1); // Exit if database cannot be opened
        }
        console.log('Connected to SQLite database.');
    });

    // Create tables if they don't exist
    sqliteDb.serialize(() => {
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS Billing (
                BillingDocument TEXT PRIMARY KEY,
                SDDocumentCategory TEXT,
                SalesOrganization TEXT,
                BillingDocumentDate TEXT,
                TotalNetAmount REAL,
                FiscalYear TEXT,
                CompanyCode TEXT
            )
        `);

        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS BillingItems (
                BillingDocumentItem TEXT PRIMARY KEY,
                BillingDocumentItemText TEXT,
                BaseUnit TEXT,
                BillingQuantityUnit TEXT,
                Plant TEXT,
                StorageLocation TEXT,
                BillingDocument TEXT,
                FOREIGN KEY (BillingDocument) REFERENCES Billing(BillingDocument)
            )
        `);
    });

    this.on('READ', 'BillingInfo', async req => {
        req.query.SELECT.columns = [
            { ref: ['BillingDocument'] },
            { ref: ['SDDocumentCategory'] },
            { ref: ['SalesOrganization'] },
            { ref: ['BillingDocumentDate'] },
            { ref: ['TotalNetAmount'] },
            { ref: ['FiscalYear'] },
            { ref: ['CompanyCode'] }
        ];

        try {
            let res = await billingapi.run(req.query);

            // Log the response for debugging
            console.log('Received BillingInfo data:', res);

            sqliteDb.serialize(() => {
                for (let record of res) {
                    sqliteDb.run(
                        `INSERT OR REPLACE INTO Billing (BillingDocument, SDDocumentCategory, SalesOrganization, BillingDocumentDate, TotalNetAmount, FiscalYear, CompanyCode) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            record.BillingDocument,
                            record.SDDocumentCategory,
                            record.SalesOrganization,
                            record.BillingDocumentDate,
                            record.TotalNetAmount,
                            record.FiscalYear,
                            record.CompanyCode
                        ],
                        (err) => {
                            if (err) {
                                console.error('Error inserting record into Billing:', err.message);
                            }
                        }
                    );
                }
            });

            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });

    this.on('READ', 'BillingItem', async req => {
        req.query.SELECT.columns = [
            { ref: ['BillingDocumentItem'] },
            { ref: ['BillingDocumentItemText'] },
            { ref: ['BaseUnit'] },
            { ref: ['BillingQuantityUnit'] },
            { ref: ['Plant'] },
            { ref: ['StorageLocation'] },
            { ref: ['BillingDocument'] }
        ];

        try {
            let res = await billingapi.run(req.query);

            // Log the response for debugging
            console.log('Received BillingItem data:', res);

            sqliteDb.serialize(() => {
                for (let record of res) {
                    sqliteDb.run(
                        `INSERT OR REPLACE INTO BillingItems (BillingDocumentItem, BillingDocumentItemText, BaseUnit, BillingQuantityUnit, Plant, StorageLocation, BillingDocument) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            record.BillingDocumentItem,
                            record.BillingDocumentItemText,
                            record.BaseUnit,
                            record.BillingQuantityUnit,
                            record.Plant,
                            record.StorageLocation,
                            record.BillingDocument
                        ],
                        (err) => {
                            if (err) {
                                console.error('Error inserting record into BillingItems:', err.message);
                            }
                        }
                    );
                }
            });

            return res;
        } catch (error) {
            console.error('Error during request to remote service:', error);
            req.error(502, 'Error during request to remote service');
        }
    });
});
