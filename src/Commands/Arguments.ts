import Message from "../Message";
import VK from "vk-io";
import MapAPI from "../API/MapAPI";
import { Mods } from "../Util";
import NewsController from "../News/NewsController";
import ChatCache from "../ChatCache";
import PrivilegesManager from "../Privileges";
import TrackAPI from "../API/TrackAPI";
import BanchoV2API from "../API/Osu/Servers/V2/BanchoV2";

import { Connection } from "typeorm";
import PuppeteerInstance from "../PuppeteerInstance";
import Disabled from "../Disabled";

export default interface ICommandArguments {
    message: Message;
    database: Connection;
    mapAPI: MapAPI;
    news: NewsController;
    vk: VK;
    chats: ChatCache;
    disabled: Disabled;
    privileges: PrivilegesManager;
    uptime: number;
    track: TrackAPI;
    v2: BanchoV2API;
    puppeteer: PuppeteerInstance;
}

export interface IArgumentsWithMode {
    mode?: number;
}

export interface IArgumentsWithMods {
    mods?: number;
}

export interface ITopCommandArguments extends IArgumentsWithMode, IArgumentsWithMods {
    approximate?: number;
    morethan?: number;
    place?: number;
}

export interface IRecentCommandArguments extends IArgumentsWithMode {
    pass?: boolean;
    place?: number;
}

export interface ICompareCommandArguments extends IArgumentsWithMode, IArgumentsWithMods {}

export interface IChatCommandArguments extends IArgumentsWithMode {
    top?: number;
}

export interface IMapCommandArguments extends IArgumentsWithMods {
    accuracy?: number;
    combo?: number;
    miss?: number;
}

export interface IArgumentParser {
    arg: string;
    prefix?: string;
    suffix?: string;
    parser: (arg: string) => any;
}

export const Parsers = {
    mode: {
        arg: "mode",
        prefix: "-",
        parser(arg) {
            switch(arg) {
                case "s":
                case "ы":
                case "std":
                case "ыев":
                    return 0;
                case "t":
                case "е":
                case "taiko":
                case "ефшлщ":
                    return 1;
                case "c":
                case "с":
                case "ctb":
                case "сеи":
                    return 2;
                case "m":
                case "ь":
                case "mania":
                case "ьфтшф":
                    return 3;
            }
            return null;
        }
    },
    mods: {
        arg: "mods",
        prefix: "+",
        parser(arg) {
            let buf = "";
            let n = 0;
            for(let i = 0; i < arg.length; i++) {
                buf += arg[i].toUpperCase();
                if(buf.length > 2) buf = buf.slice(1);
                if(Mods[buf] && !(n & Mods[buf])) n += Mods[buf];
            }
            return n;
        }
    },
    miss: {
        arg: "miss",
        suffix: "m",
        parser: Number
    },
    combo: {
        arg: "combo",
        suffix: "x",
        parser: Number
    },
    place: {
        arg: "place",
        prefix: "\\",
        parser: Number
    },
    approximate: {
        arg: "approximate",
        prefix: "~",
        parser: Number
    },
    morethan: {
        arg: "morethan",
        prefix: ">",
        parser: Number
    },
    accuracy: {
        arg: "accuracy",
        suffix: "%",
        parser: Number
    },
    pass: {
        arg: "pass",
        prefix: "-",
        suffix: "p",
        parser: Boolean
    },
    top: {
        arg: "top",
        prefix: "-",
        parser: Number
    }
};

export function parseArguments<T>(args: string[], parsers: IArgumentParser[] = []): { clean: string, args: T } {
    let a = [];
    let b: any = {};
    for(let arg of args) {
        let d = false;
        for(let parser of parsers) {
            if(parser.parser == Boolean && arg == (parser.prefix + parser.suffix)) {
                b[parser.arg] = true;
                d = true;
                continue;
            }
            if(arg.length <= (parser.prefix?.length ?? 0 + parser.suffix?.length ?? 0)) continue;
            if(parser.prefix && !arg.startsWith(parser.prefix)) continue;
            if(parser.suffix && !arg.endsWith(parser.suffix)) continue;
            let value = parser.parser(arg.substr(parser.prefix?.length ?? 0, arg.length - (parser.prefix?.length ?? 0 + parser.suffix?.length ?? 0)))
            if(value !== null) {
                b[parser.arg] = value;
                d = true;
            }
        }
        if(!d) a.push(arg);
    }

    return { clean: a.join(' '), args: <T>b };
}

export interface IServerCommandArguments<T> extends ICommandArguments {
    clean?: string;
    args?: T;
}

export interface IStandaloneCommandArguments<T> extends IServerCommandArguments<T> {}