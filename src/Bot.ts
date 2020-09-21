import { VK } from "vk-io";
import { readFileSync } from "fs";
import Message from "./Message";

import Database from "./Database";
import MapAPI from "./API/MapAPI";

import Module from "./Commands/Module";
import Bancho from "./Modules/Bancho";
import Kurikku from "./Modules/Kurikku";

import BanchoAPI from "./API/Servers/Bancho";
import KurikkuAPI from "./API/Servers/Kurikku";
import EnjuuAPI from "./API/Servers/Enjuu";
import RippleAPI from "./API/Servers/Ripple";
import AkatsukiAPI from "./API/Servers/Akatsuki";
import AkatsukiRelaxAPI from "./API/Servers/AkatsukiRelax";
import BotAPI from "./BotAPI";

import cron from "node-cron";
import NewsController from "./News/NewsController";
import Admin from "./Modules/Admin";
import Main from "./Modules/Main";
import ChatCache from "./ChatCache";

export interface IBotConfig {
    vk: {
        token: string,
        groupId: number,
        ownerId: number | number[]
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
    kurikku: KurikkuAPI;
    enjuu: EnjuuAPI;
    ripple: RippleAPI;
    akatsuki: AkatsukiAPI;
    akatsukiRelax: AkatsukiRelaxAPI;
}

export default class Bot {
    config: IBotConfig = JSON.parse(readFileSync("./config.json").toString());

    vk = new VK({
        token: this.config.vk.token,
        pollingGroupId: this.config.vk.groupId
    });

    database = new Database(this.vk);
    api: IAPIList = {
        bancho: new BanchoAPI(this.config.osu.token),
        kurikku: new KurikkuAPI(),
        enjuu: new EnjuuAPI(),
        ripple: new RippleAPI(),
        akatsuki: new AkatsukiAPI(),
        akatsukiRelax: new AkatsukiRelaxAPI(),
    };
    
    modules: Module[] = [ 
        Main, 
        Admin, 
        Bancho,
        Kurikku
    ].map(m => new m(this));

    lastMaps = new ChatCache();

    maps = new MapAPI(2583);
    private adminApi = new BotAPI(this);
    
    public news = new NewsController(this);

    private startTime: number;
    public get uptime(): number {
        return ~~((Date.now() - this.startTime) / 1000);
    }
    
    constructor() {
        this.vk.updates.on("message", ctx => {
            try {
                let message = new Message(ctx);
                for(let module of this.modules)
                    module.run(message, this);
            } catch(e) {}
        });
    }

    async start() {
        await this.vk.updates.start();

        this.startTime = Date.now();

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