-- CreateTable
CREATE TABLE "bans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "until" INTEGER NOT NULL,
    "reason" TEXT
);

-- CreateTable
CREATE TABLE "covers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attachment" TEXT
);

-- CreateTable
CREATE TABLE "connections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "server" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "mode" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "newsrules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "peerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "filters" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "server" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "mode" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 9999999,
    "pp" REAL NOT NULL DEFAULT 0,
    "accuracy" REAL NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "statusesowned" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "statusId" INTEGER,

    FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "roles" ( "name" ) VALUES ( 'Default' );
INSERT INTO "roles" ( "name", "permissions" ) VALUES ( 'Owner', '*' );