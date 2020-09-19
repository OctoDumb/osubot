import Message from "../Message";
import Database from "../Database";
import VK from "vk-io";
import MapAPI from "../API/MapAPI";
import { Mods } from "../Util";
import NewsController from "../News/NewsController";
import ChatCache from "../ChatCache";

export default interface ICommandArguments {
    message: Message;
    database: Database;
    mapAPI: MapAPI;
    news: NewsController;
    vk: VK;
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
    mods?: number;
}

export interface ICompareCommandArguments extends IArgumentsWithMode, IArgumentsWithMods {}

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
                case "-s":
                case "-std":
                    return 0;
                case "-t":
                case "-taiko":
                    return 1;
                case "-c":
                case "-ctb":
                    return 2;
                case "-m":
                case "-mania":
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
    chats: ChatCache;
    clean: string;
    args: T;
}