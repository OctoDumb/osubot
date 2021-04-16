import * as path from "path";
import Message from "./Message";
import Bot, { IBotConfig } from "./Bot";
import { IHitCounts, IUserAPIResponse } from "./API/APIResponse";
import Database, { IDBUser, Server } from "./Database";
import { IPPResponse } from "./API/MapAPI";
import Logger, { LogLevel } from "./Logger";
import { PrismaClient, Role, Status, User } from "@prisma/client";
import Config from "./Config";
import { VK } from "vk-io";
import { glob } from "glob";

/**
 * Mods bitwise enum
 */
export enum Mods {
    NF = 1 << 0,
    EZ = 1 << 1,
    TD = 1 << 2,
    HD = 1 << 3,
    HR = 1 << 4,
    SD = 1 << 5,
    DT = 1 << 6,
    RX = 1 << 7,
    HT = 1 << 8,
    NC = 1 << 9,
    FL = 1 << 10,
    AT = 1 << 11,
    SO = 1 << 12,
    AP = 1 << 13,
    PF = 1 << 14,
    K4 = 1 << 15,
    K5 = 1 << 16,
    K6 = 1 << 17,
    K7 = 1 << 18,
    K8 = 1 << 19,
    FI = 1 << 20,
    RN = 1 << 21,
    CN = 1 << 22,
    TP = 1 << 23,
    K9 = 1 << 24,
    KX = 1 << 25,
    K1 = 1 << 26,
    K3 = 1 << 27,
    K2 = 1 << 28,
    V2 = 1 << 29,
    MR = 1 << 30
}

/**
 * Generate default command arguments
 * 
 * @param message Message object
 * @param param1 Bot instance
 */
export function defaultArguments(message: Message, { 
    database, vk, 
    maps: mapAPI, 
    news, lastMaps: chats, 
    privilegesManager: privileges,
    uptime, track, v2,
    screenshotCreator: screenshot
}: Bot) {
    return { 
        message, 
        database, 
        vk, mapAPI, 
        news, chats, 
        privileges,
        uptime, track,
        v2, screenshot 
    };
}

export async function getUserInfo(message: Message, server: string, db: PrismaClient, clean: string, args?: { mode?: number }) {
    let connection = await db.serverConnection.findFirst({
        where: {
            userId: message.sender,
            server
        }
    });
    let username = connection?.nickname ?? "";
    let mode = connection?.mode ?? 0;
    if(message.forwarded) {
        let forwarded = await db.serverConnection.findFirst({
            where: {
                userId: message.forwarded.senderId,
                server
            }
        });
        if(forwarded)
            username = forwarded.nickname;
    }
    if(clean)
        username = clean;
    if(mode != null)
        mode = args.mode;

    return { username, mode };
}

export async function getDBUser(database: PrismaClient, id: number): Promise<User & { role: Role }> {
    let user = await database.user.findUnique({ where: { id }, include: { role: true } });
    if(!user)
        return await database.user.create({ 
            data: { 
                id, role: { 
                    connect: { 
                        id: Config.data.vk.ownerId == id ? 2 : 1 
                    } 
                } 
            }, 
            include: { role: true } 
        });
    return user;
}

export async function getStatus(database: PrismaClient, playerId: number): Promise<Status> {
    let connections = await database.serverConnection.findMany({
        where: { playerId }
    });
    let users = await database.$transaction(
        connections.map(c => database.user.findUnique({
            where: { id: c.userId }
        }))
    );
    users = users.filter(u => u.statusId);
    return await database.status.findUnique({
        where: {
            id: users[0]?.statusId ?? 0
        }
    });
}

export async function addNotification(vk: VK, database: PrismaClient, to: number, message: string): Promise<boolean> {
    message = Message.fixString(message);
    let notification = await database.notification.create({
        data: {
            userId: to,
            message
        }
    });
    try {
        await vk.api.messages.send({
            user_id: to,
            message
        });
        notification = await database.notification.update({
            where: { id: notification.id },
            data: { delivered: true }
        });
    } catch(e) {}
    return notification.delivered;
}

export async function updateInfo(database: PrismaClient, server: string, user: IUserAPIResponse, mode: number = 0): Promise<void> {
    let where = { playerId: user.id, mode, server };
    let data = { rank: user.rank.total, pp: user.pp, accuracy: user.accuracy };

    let i = await database.stats.findFirst({ where });

    if(!i)
        await database.stats.create({ data: { ...where, ...data } });
    else
        await database.stats.updateMany({ where, data });
}

export async function getCover(database: PrismaClient, vk: VK, id: number): Promise<string> {
    let cover = await database.cover.findUnique({
        where: { id }
    });
    if(!cover) {
        try {
            let photo = await vk.upload.messagePhoto({
                source: `https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg?1`
            });
            await database.cover.create({
                data: {
                    id, attachment: photo.toString()
                }
            });
            return photo.toString();
        } catch(e) {
            await database.cover.create({
                data: {
                    id, attachment: ""
                }
            })
            return "";
        }

    } else
        return cover.attachment;
}

/**
 * Calculate accuracy for `mode` with `counts`
 * 
 * @param mode Gamemode
 * @param counts Hitcounts
 */
export function getAccuracy(mode: number, counts: IHitCounts): number {
    switch(mode) {
        case 1:
            return ( counts[300] * 2 + counts[100] ) / (
                    (counts[300] + 
                        counts[100] + 
                        counts[50] + 
                        counts.miss
                    ) * 2);
        case 2:
            return (
                counts[300] + 
                counts[100] + 
                counts[50]) / (
                    counts[300] + 
                    counts[100] + 
                    counts[50] + 
                    counts.katu + 
                    counts.miss);
        case 3:
            return (
                (counts[300] + counts.geki) * 6 + 
                counts.katu * 4 + 
                counts[100] * 2 + 
                counts[50]) / (
                    (counts[300] + 
                        counts.geki + 
                        counts.katu + 
                        counts[100] + 
                        counts[50] + 
                        counts.miss
                    ) * 6);
        default:
            return (
                counts[300] * 6 + 
                counts[100] * 2 + 
                counts[50]) / (
                    (counts[300] + 
                        counts[100] + 
                        counts[50] + 
                        counts.miss
                    ) * 6);
    }
}

/**
 * Turn mods bitwise into a string array
 * 
 * @param mods Mods bitwise
 */
export function modsToString(mods: number): string[] {
    let s = [];

    for(let i = 0; i <= 30; i++)
        if(mods & (1 << i))
            s.push(Mods[1 << i]);

    return clearMods(s);
}

/**
 * Remove unnecessary mods
 * 
 * @param mods Array of mods
 */
export function clearMods(mods: string[]) {
    if(mods.includes("NC"))
        mods.splice(mods.indexOf("DT"), 1);

    if(mods.includes("PF"))
        mods.splice(mods.indexOf("SD"), 1);

    return mods;
}

export function modsEqual(score: number, arg: number) {
    if(score & Mods.NC)
        score -= Mods.DT;
    if(score & Mods.PF)
        score -= Mods.SD;

    return score == arg;
}

/**
 * Stringify map stats object
 * 
 * @param mode Gamemode
 * @param stats Map stats
 */
export function statsToString(mode: number, stats: { ar: number, cs: number, hp: number, od: number }): string {
    switch(mode) {
        case 1:
            return `OD:${stats.od} HP:${stats.hp}`;
        case 3:
            return `Keys:${stats.cs} OD:${stats.od} HP:${stats.hp}`;
        default:
            return `AR:${stats.ar} CS:${stats.cs} OD:${stats.od} HP:${stats.hp}`;
    }
}

/**
 * Stringify hitcounts for `mode`
 * 
 * @param hits Hitcounts
 * @param mode Gamemode
 */
export function hitsToString(hits: IHitCounts, mode: number) {
    switch(mode) {
        case 3:
            return `${hits.geki}/${hits[300]}/${hits.katu}/${hits[100]}/${hits[50]}/${hits.miss}`;
        default:
            return `${hits[300]}/${hits[100]}/${hits[50]}/${hits.miss}`;
    }
}

export function hitsToFail(hits: IHitCounts, mode: number) {
    switch(mode) {
        case 0:
            return hits[300] + hits[100] + hits[50] + hits.miss;
        case 3:
            return hits[300] + hits[100] + hits[50] + hits.geki + hits.katu + hits.miss;
        default:
            return 0;
    }
}

export function fixNum(n: number): string {
    return `${n < 10 ? '0' : ''}${n}`;
}

export function formatBPM(bpm: { min: number, max: number, avg: number }): string {
    if(bpm.min == bpm.max) return `${bpm.min}`;
    return `${bpm.min}-${bpm.max} (${bpm.avg})`;
}

export function formatPP(pp: IPPResponse): string {
    if(pp.pp == pp.sspp)
        return `PP: ${round(pp.pp)}`;
    else if(pp.pp == pp.fcpp)
        return `PP: ${round(pp.pp)} ⯈ SS: ${round(pp.sspp)}`;
    else
        return `PP: ${round(pp.pp)} ⯈ FC: ${round(pp.fcpp)} ⯈ SS: ${round(pp.sspp)}`;
}

export function formatTime(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function formatDate(date: Date) {
    return `${fixNum(date.getDate())}.${fixNum(date.getMonth())}.${date.getFullYear()}`
        + ` ${fixNum(date.getHours())}:${fixNum(date.getMinutes())}`;
}

export function formatCombo(combo: number, maxCombo: number) {
    return `${combo}x${maxCombo == 0 ? '' : `/${maxCombo}x`}`;
}

export function formatChange(num: number) {
    return num < 0 ? String(num) : `+${num}`;
}

export function round(num: number, positions: number = 2) {
    return Math.round(num * (10 ** positions)) / (10 ** positions);
}

export function modeNumberToString(mode: number): string {
    return ["osu!", "osu!Taiko", "osu!Catch", "osu!Mania"][mode];
}

export function changeKeyboardLayout(string: string): null | string {
    if(!/[а-яА-ЯёЁ]+/.test(string)) return null;

    const en = [
        "q","w","e","r","t","y","u","i","o","p","\[","\]",
        "a","s","d","f","g","h","j","k","l",";","'",
        "z","x","c","v","b","n","m",",","."
    ];

    const ru = [
        "й","ц","у","к","е","н","г","ш","щ","з","х","ъ",
        "ф","ы","в","а","п","р","о","л","д","ж","э",
        "я","ч","с","м","и","т","ь","б","ю"
    ];

    ru.forEach((s, i) => {
        let regExp = new RegExp(`${s}+`, "gi");
        string = string.replace(regExp, en[i]);
    });

    return string;
}

export function clearObject(a: object) {
    for(let key of Object.keys(a)) {
        if(a[key] == undefined)
            delete a[key];
    }
    return a;
}

export function stringDateToMs(s: string): number {
    let r = /(?<w>\d+[нw])?(?<d>\d+[дd])?(?<h>\d+[чh])?(?<m>\d+[мm])?/i;
    let m = s.match(r);
    Logger.log(LogLevel.DEBUG, `[stringDateToMs] ${JSON.stringify(m.groups)}`);
    return ((parseInt(m.groups.w ?? "0")) * 7 * 24 * 60 +
        (parseInt(m.groups.d ?? "0")) * 24 * 60 +
        (parseInt(m.groups.h ?? "0")) * 60 +
        (parseInt(m.groups.m ?? "0"))) * 60 * 1e3;
}

export function importClassesFromDirectories(directories: string[], formats = [".js", ".cjs", ".ts"], log = false): Function[] {
    const classesNotFoundMessage = "No classes were found using the provided glob pattern: ";
    const classesFoundMessage = "All classes found using provided glob pattern";

    function loadFileClasses(exported: any, allLoaded: Function[]) {
        if (Array.isArray(exported)) {
            exported.forEach((i: any) => loadFileClasses(i, allLoaded));
        } else if (typeof exported === "object" && exported !== null) {
            Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded));
        }
        return allLoaded;
    }

    const allFiles = directories.reduce((allDirs, dir) => {
        return allDirs.concat(glob.sync(path.normalize(dir)));
    }, [] as string[]);

    if (log) {
        if (directories.length > 0 && allFiles.length === 0) {
            console.log(`${classesNotFoundMessage} "${directories}"`);
        } else if (allFiles.length > 0) {
            console.log(`${classesFoundMessage} "${directories}" : "${allFiles}"`);
        }
    }

    const dirs = allFiles
        .filter(file => {
            const dtsExtension = file.substring(file.length - 5, file.length);
            return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== ".d.ts";
        })
        .map(file => require(path.resolve(file)));

    return loadFileClasses(dirs, []);
}