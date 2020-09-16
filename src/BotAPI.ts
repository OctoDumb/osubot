import express from "express";
import bodyParser from "body-parser";
import Bot from "./Bot";
import md5 from "md5";

export default class BotAPI {
    private app = express();

    private token: string;

    constructor(
        private bot: Bot
    ) {
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.addAuthorization()
        this.createEndpoints();

        let { api: config } = bot.config;

        this.token = md5(config.password);

        this.app.listen(config.port);
        console.log("API listening!");
    }

    addAuthorization() {
        this.app.use((req, res, next) => {
            res.setHeader('Content-Type', 'application/json');
            if(req.url.split('?')[0] == '/auth' && req.method == 'POST') return next();
            if(req.query?.token != this.token) return res.status(401).send({ "error": "Unauthorized access. Wrong token" });
            next();
        });
    }

    createEndpoints() {
        this.app.get('/', (_req, res) => {
            let { uptime } = this.bot;
            res.send({ uptime });
        });

        this.app.post('/auth', (req, res) => {
            console.log(req.body);
            if(md5(req.body?.password as string ?? "") == this.token)
                return res.send({ "token": this.token });
            
            res.status(401).send({ "error": "Wrong password" });
        });

        this.app.get('/db', async (_req, res) => {
            let { database: db } = this.bot;
            res.send({
                users: {
                    bancho: await db.getCountAt("bancho"),
                    gatari: await db.getCountAt("gatari"),
                    ripple: await db.getCountAt("ripple"),
                    akatsuki: await db.getCountAt("akatsuki"),
                    kurikku: await db.getCountAt("kurikku"),
                    enjuu: await db.getCountAt("enjuu")
                },
                stats: {
                    bancho: await db.getCountsAt([
                        "bancho_stats_0",
                        "bancho_stats_1",
                        "bancho_stats_2",
                        "bancho_stats_3"
                    ]),
                    gatari: await db.getCountsAt([
                        "gatari_stats_0",
                        "gatari_stats_1",
                        "gatari_stats_2",
                        "gatari_stats_3"
                    ]),
                    ripple: await db.getCountsAt([
                        "ripple_stats_0",
                        "ripple_stats_1",
                        "ripple_stats_2",
                        "ripple_stats_3"
                    ]),
                    akatsuki: await db.getCountsAt([
                        "akatsuki_stats_0",
                        "akatsuki_stats_1",
                        "akatsuki_stats_2",
                        "akatsuki_stats_3"
                    ]),
                    kurikku: await db.getCountsAt([
                        "kurikku_stats_0",
                        "kurikku_stats_1",
                        "kurikku_stats_2",
                        "kurikku_stats_3"
                    ]),
                    enjuu: await db.getCountsAt([
                        "enjuu_stats_0",
                        "enjuu_stats_1",
                        "enjuu_stats_2",
                        "enjuu_stats_3"
                    ])
                },
                covers: await db.getCountAt("covers")
            });
        });

        this.app.post('/db/get', async (req, res) => {
            if(req.body?.query == null) 
                return res.status(400).send({ "error": "Missing query" });
            var row = await this.bot.database.get(req.body.query);

            res.send({ result: row });
        });

        this.app.post('/db/all', async (req, res) => {
            if(req.body?.query == null) 
                return res.status(400).send({ "error": "Missing query" });
            var rows = await this.bot.database.all(req.body.query);

            res.send({ result: rows });
        });

        this.app.post('/db/run', async (req, res) => {
            if(req.body?.query == null) 
                return res.status(400).send({ "error": "Missing query" });
            var result = await this.bot.database.run(req.body.query);

            res.send({ result });
        });

        this.app.get('/uses', (_req, res) => {
            res.send(this.bot.modules.map(m => ({
                name: m.name,
                commands: m.commands.map(({ name, uses }) => ({
                    name, uses
                }))
            })));
        });
    }
}