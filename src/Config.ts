import { readFileSync } from "fs";

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

export default class Config {
    static data: IBotConfig = JSON.parse(readFileSync("./config.json").toString());
}