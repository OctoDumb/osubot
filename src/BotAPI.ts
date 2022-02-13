import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Bot from "./Bot";
import md5 from "md5";
import Logger from "./Logger";
import Config from "./Config";
import { ServerConnection } from "./Database/entity/ServerConnection";
import { Stats } from "./Database/entity/Stats";
import { Cover } from "./Database/entity/Cover";

export default class BotAPI {
    private app = express();

    private token: string;

    constructor(
        private bot: Bot
    ) {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());

        this.app.use('/public', express.static('cards/public'));

        this.setContentType();
        this.createEndpoints();

        let { api: config } = Config.data;

        this.token = md5(config.password);

        this.app.listen(config.port);

        Logger.info(`Bot API listening on port ${config.port}`, "API");
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
            Logger.debug("Bot API authorization attempt", "API");
            if(md5(req.body?.password as string ?? "") == this.token)
                return res.send({ "token": this.token });
            
            res.status(401).send({ "error": "Wrong password" });
        });

        this.app.get('/db', this.auth.bind(this), async (_req, res) => {
            res.send({
                users: {
                    bancho: await ServerConnection.count({ where: { server: "Bancho" } }),
                    gatari: await ServerConnection.count({ where: { server: "Gatari" } }),
                    ripple: await ServerConnection.count({ where: { server: "Ripple" } }),
                    akatsuki: await ServerConnection.count({ where: { server: "Akatsuki" } }),
                    kurikku: await ServerConnection.count({ where: { server: "Kurikku" } }),
                    enjuu: await ServerConnection.count({ where: { server: "Enjuu" } })
                },
                stats: {
                    bancho: await Stats.count({ where: { server: "Bancho" } }),
                    gatari: await Stats.count({ where: { server: "Gatari" } }),
                    ripple: await Stats.count({ where: { server: "Ripple" } }),
                    akatsuki: await Stats.count({ where: { server: "Akatsuki" } }),
                    kurikku: await Stats.count({ where: { server: "Kurikku" } }),
                    enjuu: await Stats.count({ where: { server: "Enjuu" } })
                },
                covers: await Cover.count()
            });
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