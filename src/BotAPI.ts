import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Bot from "./Bot";
import md5 from "md5";
import Logger, { LogLevel } from "./Logger";

export default class BotAPI {
    private app = express();

    private token: string;

    constructor(
        private bot: Bot
    ) {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());

        this.setContentType();
        this.createEndpoints();

        let { api: config } = bot.config;

        this.token = md5(config.password);

        this.app.listen(config.port);

        Logger.log(LogLevel.MESSAGE, `[API] Bot API listening on port ${config.port}`);
    }

    setContentType() {
        this.app.use((req, res, next) => {
            res.setHeader('Content-Type', 'application/json');
            next();
        });
    }

    auth(req, res, next) {
        if(req.query?.token != this.token) 
            return res.status(401).send({ "error": "Unauthorized access. Wrong token" });
        next();
    }

    createEndpoints() {
        this.app.get('/', (_req, res) => {
            let { uptime } = this.bot;
            res.send({ uptime });
        });

        this.app.post('/auth', (req, res) => {
            Logger.log(LogLevel.DEBUG, "Bot API authorization attempt");
            if(md5(req.body?.password as string ?? "") == this.token)
                return res.send({ "token": this.token });
            
            res.status(401).send({ "error": "Wrong password" });
        });

        this.app.get('/db', this.auth.bind(this), async (_req, res) => {
            let { database: db } = this.bot;
            await db.serverConnection.count({ where: { server: "Bancho" } })
            res.send({
                users: {
                    bancho: await db.serverConnection.count({ where: { server: "Bancho" } }),
                    gatari: await db.serverConnection.count({ where: { server: "Gatari" } }),
                    ripple: await db.serverConnection.count({ where: { server: "Ripple" } }),
                    akatsuki: await db.serverConnection.count({ where: { server: "Akatsuki" } }),
                    kurikku: await db.serverConnection.count({ where: { server: "Kurikku" } }),
                    enjuu: await db.serverConnection.count({ where: { server: "Enjuu" } })
                },
                stats: {
                    bancho: await db.stats.count({ where: { server: "Bancho" } }),
                    gatari: await db.stats.count({ where: { server: "Gatari" } }),
                    ripple: await db.stats.count({ where: { server: "Ripple" } }),
                    akatsuki: await db.stats.count({ where: { server: "Akatsuki" } }),
                    kurikku: await db.stats.count({ where: { server: "Kurikku" } }),
                    enjuu: await db.stats.count({ where: { server: "Enjuu" } })
                },
                covers: await db.cover.count()
            });
        });

        this.app.post('/db/get', this.auth.bind(this), async (req, res) => {
            if(req.body?.query == null) 
                return res.status(400).send({ "error": "Missing query" });
            var result = await this.bot.database.$queryRaw(req.body.query);

            res.send({ result })
        });

        this.app.post('/db/run', this.auth.bind(this), async (req, res) => {
            if(req.body?.query == null) 
                return res.status(400).send({ "error": "Missing query" });
            var result = await this.bot.database.$executeRaw(req.body.query);

            res.send({ result })
        });

        this.app.get('/uses', this.auth.bind(this), (_req, res) => {
            res.send(this.bot.modules.map(m => ({
                name: m.name,
                commands: m.commands.map(({ name, uses }) => ({
                    name, uses
                }))
            })));
        });
    }
}