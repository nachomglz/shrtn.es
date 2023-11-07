import app from './app'
import db from './utils/db'

const PORT = process.env.PORT ?? 4000

// Create db tables
db.serialize(() => {
    db.run(`
        CREATE table if not exists url (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expiration_date TEXT,
            original_url TEXT,
            shortened_url TEXT UNIQUE
        );
    `, (error) => {
        if (error) {
            console.error(`[ERROR] ~ Error creating DB tables`)
        } else {
            console.log(`[INFO] ~ DB Set up successfull`)
        }
    })
})

app.listen(PORT, () => console.log(`[INFO] ~ Serving listening on http://localhost:${PORT}`))