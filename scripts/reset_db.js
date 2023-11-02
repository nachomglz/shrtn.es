// import sqlite3 database
const sqlite3 = require('sqlite3').verbose();

// Create db with the 'url_db.db' database file
let db = new sqlite3.Database('url_db.db', (err) => {
    if (err) {
        console.error(`[ERROR] ~ ${err.message}`);
    }
    console.log('[INFO] ~ Connected to the url_db database.');
})

// remove all the rows from the 'url' table
db.run(`DELETE FROM url`, (err) => {
    if (err) {
        console.error(`[ERROR] ~ ${err.message}`);
    }
    console.log('[INFO] ~ All rows deleted from url table.');
})
