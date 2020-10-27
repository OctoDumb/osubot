import { AttachmentType, MessageContext, VK } from "vk-io";
import { readFileSync } from "fs";
import cron from "node-cron";

import Message from "./Message";
import Database from "./Database";
import MapAPI from "./API/MapAPI";
import NewsController from "./News/NewsController";
import ChatCache from "./ChatCache";
import BotAPI from "./BotAPI";
import PrivilegesManager from "./Privileges";
import StandaloneCommand from "./Commands/StandaloneCommand";
import MapCommand from "./StandaloneCommands/Map";
import MapLinkProcessor from "./MapLinkProcessor";

import Admin from "./Modules/Admin";
import Main from "./Modules/Main";

import Module from "./Commands/Module";
import Bancho from "./Modules/Bancho";
import Gatari from "./Modules/Gatari"
import Kurikku from "./Modules/Kurikku";
import Ripple from "./Modules/Ripple";
import Enjuu from "./Modules/Enjuu";

import BanchoAPI from "./API/Servers/Bancho";
import GatariAPI from "./API/Servers/Gatari";
import KurikkuAPI from "./API/Servers/Kurikku";
import EnjuuAPI from "./API/Servers/Enjuu";
import RippleAPI from "./API/Servers/Ripple";
import AkatsukiAPI from "./API/Servers/Akatsuki";
import AkatsukiRelaxAPI from "./API/Servers/AkatsukiRelax";
import Akatsuki from "./Modules/Akatsuki";
import AkatsukiRelax from "./Modules/AkatsukiRelax";
import BanchoV2API from "./API/Servers/BanchoV2";
import ScreenshotCreator from "./ScreenshotCreator";
import TrackAPI from "./API/TrackAPI";

export interface IBotConfig {
    vk: {
        token: string,
        groupId: number,
        ownerId: number
    },
    osu: {
        token: string,
        username: string,
        password: string
    },
    api: {
        port: number,
        password: string
    }
}

export interface IAPIList {
    bancho: BanchoAPI;
    gatari: GatariAPI;
    kurikku: KurikkuAPI;
    enjuu: EnjuuAPI;
    ripple: RippleAPI;
    akatsuki: AkatsukiAPI;
    akatsukiRelax: AkatsukiRelaxAPI;
}

interface IMapLink {
    beatmapsetId?: number;
    beatmapId?: number;
}

export default class Bot {
    config: IBotConfig = JSON.parse(readFileSync("./config.json").toString());

    vk = new VK({
        token: this.config.vk.token,
        pollingGroupId: this.config.vk.groupId
    });

    database = new Database(this.vk);
    screenshotCreator = new ScreenshotCreator();
    api: IAPIList = {
        bancho: new BanchoAPI(this.config.osu.token),
        gatari: new GatariAPI(),
        kurikku: new KurikkuAPI(),
        enjuu: new EnjuuAPI(),
        ripple: new RippleAPI(),
        akatsuki: new AkatsukiAPI(),
        akatsukiRelax: new AkatsukiRelaxAPI(),
    };

    v2 = new BanchoV2API();

    track = new TrackAPI();
    
    modules: Module[] = [ 
        Main, 
        Admin, 
        Bancho,
        Gatari,
        Kurikku,
        Enjuu,
        Ripple,
        Akatsuki,
        AkatsukiRelax
    ].map(m => new m(this));

    commands: StandaloneCommand[] = [
        new MapCommand()
    ];

    lastMaps = new ChatCache();

    maps = new MapAPI(2583);

    mapLinkProcessor = new MapLinkProcessor(this);
    private adminApi = new BotAPI(this);
    
    public news = new NewsController(this);

    private startTime: number;
    public get uptime(): number {
        return ~~((Date.now() - this.startTime) / 1000);
    }

    public privilegesManager = new PrivilegesManager();
    
    constructor() {
        this.vk.updates.on("message", async ctx => {
            try {
                let message = new Message(ctx);

                let mapLink = this.mapLinkProcessor.checkLink(message, ctx);

                if (mapLink) 
                    return this.mapLinkProcessor.process(message, mapLink);

                for(let module of this.modules)
                    module.run(message, this);
                
                for(let command of this.commands) {
                    message.arguments.unshift(message.command);

                    if(command.command.includes(message.prefix)) {
                        try {
                            let args = command.parseArguments(message, this);
                            command.use();
                            command.run(args);
                        } catch(e) {
                            message.reply(`Ошибка! ${e instanceof Error ? e.message : e}`);
                        }
                    }
                }
            } catch(e) {console.log(e)}
        });
    }

    async start() {
        await this.vk.updates.start();

        this.startTime = Date.now();

        await this.v2.login(
            this.config.osu.username,
            this.config.osu.password
        );

        await this.screenshotCreator.launch();

        /* this.v2.data.start(); */

        cron.schedule('*/5 * * * *', () => { this.updateUses() });

        console.log("Started!");
    }

    private updateUses() {
        for(let module of this.modules) {
            for(let command of module.commands) {
                command.uses.push(0);
                if(command.uses.length > 12)
                    command.uses.shift();
            }
        }
    }
}