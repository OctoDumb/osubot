var sqlite = require('sqlite3'),
    db = new sqlite.Database('osubot.db');

async function run(stmt, ...opts) {
    return new Promise((r,j) => {
        db.run(stmt, ...opts, function() {
            r(this);
        });
    });
}

async function initDB() {
    await run(`
    CREATE TABLE IF NOT EXISTS "users" (
        "id"	INTEGER NOT NULL,
        "roleId"	INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY("id")
    );
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "roles" (
        "id"	INTEGER NOT NULL,
        "name"	TEXT NOT NULL,
        "permissions"	TEXT NOT NULL DEFAULT '',
        PRIMARY KEY("id" AUTOINCREMENT)
    )
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "connections" (
        "id"	INTEGER NOT NULL,
        "server"	TEXT NOT NULL,
        "userId"	INTEGER NOT NULL,
        "playerId"	INTEGER NOT NULL,
        "nickname"	TEXT NOT NULL,
        PRIMARY KEY("id" AUTOINCREMENT)
    )
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "stats" (
        "id"	INTEGER NOT NULL,
        "server"	TEXT NOT NULL,
        "playerId"	INTEGER NOT NULL,
        "mode"	INTEGER NOT NULL,
        "rank"	INTEGER NOT NULL DEFAULT 9999999,
        "pp"	REAL NOT NULL DEFAULT 0,
        "accuracy"	REAL NOT NULL DEFAULT 100,
        PRIMARY KEY("id" AUTOINCREMENT)
    );
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "bans" (
        "id"	INTEGER NOT NULL,
        "userId"	INTEGER NOT NULL,
        "until"	INTEGER NOT NULL,
        "reason"	TEXT,
        "isNotified"	NUMERIC NOT NULL DEFAULT 'FALSE',
        PRIMARY KEY("id" AUTOINCREMENT)
    )
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "newsrules" (
        "id"	INTEGER NOT NULL,
        "peerId"	INTEGER NOT NULL,
        "type"	TEXT NOT NULL,
        "enabled"	NUMERIC NOT NULL DEFAULT 'FALSE',
        "filters"	TEXT NOT NULL DEFAULT '',
        PRIMARY KEY("id" AUTOINCREMENT)
    )
    `);

    await run(`
    CREATE TABLE IF NOT EXISTS "covers" (
        "id"	INTEGER NOT NULL,
        "attachment"	TEXT,
        PRIMARY KEY("id")
    )
    `)

    await run(`
    INSERT INTO "roles" ( name, permissions )
    SELECT 'Default', ''
    WHERE NOT EXISTS(SELECT 1 FROM "roles" WHERE id = 1)
    `);
}

initDB()
    .catch(e => {
        console.log("Error when initializing database");
    })
    .finally(() => {
        console.log("Finished");
    })