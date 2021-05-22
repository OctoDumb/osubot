import * as sqlite from "sqlite3";
import VK from "vk-io";
import { IUserAPIResponse } from "./API/Osu/APIResponse";

export class Covers {
    constructor(
        private db: Database
    ) {}

    async getCover(id: number): Promise<string> {
        let cover = await this.db.get('SELECT * FROM covers WHERE id = ?', id);

        if(!cover.id) 
            return this.addCover(id);
        return cover.attachment;
    }

    async addCover(id: number): Promise<string> {
        let photo = await this.db.vk.upload.messagePhoto({
            source: `https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg?1`
        });

        await this.db.run('INSERT INTO covers (id, attachment) VALUES (?, ?)', id, photo.toString());

        return photo.toString();
    }

    async removeEmpty() {
        await this.db.run('DELETE FROM covers WHERE attachment = ?', '');
    }
}

interface IError {
    code: string;
    text: string;
    sender: number;
    reply?: number;
    module: string;
    command: string;
}

export class Errors {
    constructor(
        private db: Database
    ) {}

    static get RandomHash(): string {
        const 
            min = 16 ** 11,
            max = 16 ** 12;
        return Math.floor(Math.random() * (max - min) + min).toString(16);
    }

    // async getError(id: string): Promise<IError> {
        // let 
    // }

    async addError() {
        //
    }
}

export interface IDBUser {
    id: number;
    uid: number;
    nickname: string;
    mode: number;
}

export interface IDBUserStats {
    id: number;
    nickname: string;
    pp: number;
    rank: number;
    acc: number;
}

export class Server {
    constructor(
        private db: Database, 
        public table: string
    ) {}

    async getUser(id: number): Promise<IDBUser> {
        return this.db.get(`SELECT * FROM ${this.table} WHERE id = ?`, id);
    }

    async findByUserId(id: number): Promise<IDBUser[]> {
        return this.db.all(`SELECT * FROM ${this.table} WHERE uid = ?`, id);
    }

    async setNickname(id: number, uid: number, nickname: string) {
        let user = await this.getUser(id);
        if(!user.id)
            await this.db.run(`INSERT INTO ${this.table} (id, uid, nickname) VALUES (?, ?, ?)`, id, uid, nickname);
        else
            await this.db.run(`UPDATE ${this.table} SET nickname = ?, uid = ? WHERE id = ?`, nickname, uid, id);
    }

    async setMode(id: number, mode: number): Promise<boolean> {
        let user = await this.getUser(id);
        if(!user.id)
            return false;
        await this.db.run(`UPDATE ${this.table} SET mode = ? WHERE id = ?`, mode, id);

        return true;
    }

    async updateInfo(user: IUserAPIResponse, mode: number) {
        let dbuser = await this.db.get(`SELECT * FROM ${this.table}_stats_${mode} WHERE id = ?`, user.id);
        if(!dbuser.id)
            await this.db.run(
                `INSERT INTO ${this.table}_stats_${mode} (id, nickname, pp, rank, acc) VALUES (?, ?, ?, ?, ?)`, 
                user.id, 
                user.username, 
                user.pp, 
                user.rank.total, 
                user.accuracy
            );
        else
            await this.db.run(
                `UPDATE ${this.table}_stats_${mode} SET nickname = ?, pp = ?, rank = ?, acc = ? WHERE id = ?`,
                user.username,
                user.pp,
                user.rank.total,
                user.accuracy,
                user.id
            );
    }

    async getUserStats(id: number, mode: number): Promise<IDBUserStats> {
        let u = await this.getUser(id);
        return await this.db.get(`SELECT * FROM ${this.table}_stats_${mode} WHERE id = ?`, u.uid);
    }
}

export default class Database {
    db: sqlite.Database = new sqlite.Database('bot.db');

    servers = {
        bancho: new Server(this, "bancho"),
        gatari: new Server(this, "gatari"),
        ripple: new Server(this, "ripple"),
        akatsuki: new Server(this, "akatsuki"),
        enjuu: new Server(this, "enjuu"),
        kurikku: new Server(this, "kurikku")
    };

    covers = new Covers(this);

    errors = new Errors(this);

    constructor(
        public vk: VK
    ) {
        for(let s in this.servers) {
            let server = this.servers[s];
            this.run(`CREATE TABLE IF NOT EXISTS ${server.table} (id INTEGER, uid INTEGER, nickname TEXT, mode INTEGER DEFAULT 0)`);
            for(let i = 0; i < 4; i++)
                this.run(`CREATE TABLE IF NOT EXISTS ${server.table}_stats_${i} (id INTEGER, nickname TEXT, pp REAL DEFAULT 0, rank INTEGER DEFAULT 9999999, acc REAL DEFAULT 100)`);
        }

        this.run("CREATE TABLE IF NOT EXISTS covers (id INTEGER, attachment TEXT)");
        // this.run("CREATE TABLE IF NOT EXISTS errors ()");
    }

    async get(stmt: string, ...opts: any[]): Promise<any> {
        return new Promise(r => {
            this.db.get(stmt, ...opts, (_err, row: any) => {
                r(row ?? {});
            });
        });
    }

    async all(stmt: string, ...opts: any[]): Promise<any[]> {
        return new Promise(r => {
            this.db.all(stmt, ...opts, (_err, rows: any[]) => {
                r(rows);
            });
        });
    }

    async run(stmt: string, ...opts: any[]): Promise<sqlite.RunResult> {
        return new Promise(r => {
            this.db.run(stmt, ...opts, function() {
                r(this);
            });
        });
    }

    async getCountAt(table: string): Promise<number> {
        return Number((await this.get(`SELECT COUNT(*) FROM ${table}`))["COUNT(*)"]);
    }

    async getCountsAt(tables: string[]): Promise<number> {
        return (await Promise.all(tables.map(table => this.getCountAt(table)))).reduce((a, b) => a + b);
    }
}