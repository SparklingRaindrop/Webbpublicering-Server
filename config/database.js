const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./config/db.sqlite', async (error) => {

    if (error) {
        console.error(error.message);
        throw error;
    }

    const userStatement = `
        CREATE TABLE IF NOT EXISTS User (
            id STRING PRIMARY KEY,
            name TEXT NOT NULL,
            current_room_id INTEGER NOT NULL,
            FOREIGN KEY (current_room_id)
                REFERENCES Room (id)
        );
    `;

    const roomStatement = `
        CREATE TABLE IF NOT EXISTS Room (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            password STRING
        );
    `;

    const messageStatement = `
        CREATE TABLE IF NOT EXISTS Message (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            sender STRING NOT NULL,
            sender_name STRING NOT NULL,
            receiver STRING,
            room_id INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id)
                REFERENCES Room (id) ON DELETE CASCADE
        );
    `;
    
    await Promise.all([userStatement, roomStatement, messageStatement].map(statement => {
        return new Promise((resolve, reject) => {
            db.run(statement, (error) => {
                if (error) {
                    console.error(error.message);
                    reject();
                }
                resolve();
            });
            
        })
    }));

    const lobbyStatement = `INSERT INTO Room (name)
        SELECT name 
        FROM (SELECT 'lobby' as name) Sub
        WHERE NOT EXISTS (SELECT 1 FROM Room WHERE Room.name = Sub.name);
    `;
    
    await new Promise((resolve, reject) => {
        db.run(lobbyStatement, (error) => {
            if (error) {
                console.error(error.message);
                reject();
            }
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        db.run('PRAGMA foreign_keys = ON;', (error) => {
            if (error) {
                console.error(error.message);
                reject();
            }
            resolve();
        });
    });
});

module.exports = db;