import { 
    IUserAPIResponse,
    ITopAPIResponse,
    IRecentAPIResponse, 
    IScoreAPIResponse
} from "./API/APIResponse";
import ServerModule from "./Commands/Server/ServerModule";
import { IBeatmap, IPPResponse } from "./API/MapAPI";
import { statsToString, formatTime, formatBPM, modsToString, hitsToString, round, formatDate, formatPP } from "./Util";
import Message from "./Message";
import { IDBUser, IDBUserStats } from "./Database";
import IReplay from "./Replay/Replay";
import { UsersGetResponse } from "vk-io";
import { IChatTopUser } from "./Modules/ServerCommands/Chat";

function joinMods(mods: string[]) {
    return (mods.length ? "+" : "") + mods.join('');
}

/**
 * Message template for User command 
 */
export function UserTemplate(server: ServerModule, user: IUserAPIResponse, status: string) {
    let { 
        username, id, 
        country, rank, 
        playcount, 
        level, pp, 
        accuracy
    } = user;
    
    return `
        [Server: ${server.name}]
        Player ${username} ${status}
        Rank: #${rank.total} (${country}#${rank.country})
        Playcount: ${playcount} (Lv${Math.floor(level)})
        PP: ${Math.round(pp)}
        Accuracy: ${accuracy.toFixed(2)}%

        ${server.baseLink}u/${id}
    `;
}

/**
 * Message template for Top command 
 */
export function TopTemplate(server: ServerModule, nickname: string, scores: ITopAPIResponse[], maps: IBeatmap[], status: string) {
    return `
        [Server: ${server.name}]
        Топ скоры игрока ${nickname} ${status} [${scores[0].mode}]
        ${scores.map((score, i) => {
            let map = maps[i];
            let length = formatTime(~~(map.length / 1e3));
            let modsString = joinMods(modsToString(score.mods));
            return `${map.title} [${map.version}] ${modsString}
                ${statsToString(map.mode, map.difficulty)} ${round(map.difficulty.stars)}✩
                Grade: ${score.rank} > ${score.maxCombo}x > ${length}
                Accuracy: ${round(score.accuracy * 100)}% > ${hitsToString(score.counts, score.mode)}
                PP: ${score.pp}
                ${formatDate(score.date)}
                ${server.baseLink}b/${score.beatmapId}`;
        }).join("\n")}
    `;
}

/**
 * Message template for Top command with `place` argument
 */
export function TopSingleTemplate(server: ServerModule, nickname: string, score: ITopAPIResponse, place: number, map: IBeatmap, status: string) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(score.mods));
    return `
        [Server: ${server.name}]
        Топ #${place} плей игрока ${nickname} ${status} (${score.mode})
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        ${formatDate(score.date)}
        Score: ${score.score} | Combo: ${score.maxCombo}x
        Accuracy: ${round(score.accuracy * 100)}%
        Hitcounts: ${hitsToString(score.counts, score.mode)}
        PP: ${score.pp} | Grade: ${score.rank}

        ${server.baseLink}b/${score.beatmapId}
    `
}

/**
 * Message template for Recent command
 */
export function RecentTemplate(server: ServerModule, recent: IRecentAPIResponse, map: IBeatmap, pp: IPPResponse) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(recent.mods));
    return `
        [Server: ${server.name}]
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        Score: ${recent.score} | Combo: ${recent.maxCombo}x
        Accuracy: ${round(recent.accuracy * 100)}%
        ${formatPP(pp)}
        Hitcounts: ${hitsToString(recent.counts, recent.mode)}
        Grade: ${recent.rank} (72.7%)

        Beatmap: ${server.baseLink}b/${recent.beatmapId}
    `;
}

/**
 * Message template for Compare command 
 */
export function CompareScoreTemplate(server: ServerModule, score: IScoreAPIResponse, pp: IPPResponse, map: IBeatmap) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(score.mods));
    return `
        [Server: ${server.name}]
        Top score on ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        ${formatDate(score.date)}
        Score: ${score.score} | Combo: ${score.maxCombo}x
        Accuracy: ${round(score.accuracy * 100)}%
        ${formatPP(pp)}
        Hitcounts: ${hitsToString(score.counts, score.mode)}
        Grade: ${score.rank}
    `;
}

/**
 * Message template for Chat command 
 */
export function ChatTopTemplate(server: ServerModule, chat: number, users: IChatTopUser[], full?: number) {
    if(users.length == 0)
        return `
            [Server: ${server.name}]
            Не найдено статистик для этого чата
        `;
    return `
        [Server: ${server.name}]
        Топ${full ? '' : `-${users.length}`} беседы (ID ${chat}):
        ${users.sort((a, b) => b.stats.pp - a.stats.pp).map((u, i) => `
            #${i + 1} ${u.stats.nickname} ${u.status} | ${round(u.stats.pp, 1)} | Ранк ${u.stats.rank} | ${round(u.stats.acc)}%
        `).join('\n')}
    `;
}

/**
 * Message template for Leaderboard command 
 */
export function LeaderboardTemplate(server: ServerModule, scores: {user: IDBUser, score: IScoreAPIResponse}[], map: IBeatmap) {
    return `
        [Server: ${server.name}]
        Топ беседы на карте ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${scores.map((s, i) => {
            let { user, score } = s;
            return `
                #${i + 1} ${user.nickname} | ${score.score} | ${score.maxCombo}x | ${round(score.accuracy)}% | ${round(0)}pp | ${score.date}
            `;
        }).map(Message.fixString)
            .join('\n')}
    ` ;
}

/**
 * Message template for Find command 
 */
export function FindTemplate(server: ServerModule, username: string, users: UsersGetResponse) {
    let links = users.map(u => `[id${u.id}|${u.first_name} ${u.last_name}]`).join("\n");
    return `
        [Server: ${server.name}]
        Пользователи с ником ${username}:
        ${links}
    `
}

export function ReplayTemplate(replay: IReplay, map: IBeatmap, pp: IPPResponse) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(replay.mods));
    return `
        ${replay.player}'s replay

        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(replay.mode, map.difficulty)} | ${map.difficulty.stars} ${modsString}

        Score: ${replay.score} | Combo: ${replay.combo}x
        Accuracy: ${round(replay.accuracy)}%
        ${formatPP(pp)}
        Hitcounts: ${hitsToString(replay.counts, replay.mode)}
    `;
}

export function MapTemplate(map: IBeatmap, pp: IPPResponse, mods: string[]) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(mods);
    return `
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} | ${map.difficulty.stars} ${modsString}
        Accuracy: ${round(pp.param.acc)}%
        Combo: ${pp.param.combo}x | ${pp.param.miss} misses
        - PP: ${round(pp.pp)}
    `;
}

export function MapInfoTemplate(map: IBeatmap, pp98: IPPResponse, pp99: IPPResponse) {
    let length = formatTime(~~(map.length / 1e3));
    return `
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} | ${map.difficulty.stars}
        PP:
        - 98% = ${pp98.pp}
        - 99% = ${pp99.pp}
        - 100% = ${pp99.sspp}
    `;
}