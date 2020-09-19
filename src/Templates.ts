import { 
    IUserAPIResponse,
    ITopAPIResponse,
    IRecentAPIResponse, IScoreAPIResponse
} from "./API/APIResponse";
import ServerModule from "./Commands/Server/ServerModule";
import { IBeatmap, IPPResponse } from "./API/MapAPI";
import { statsToString, formatTime, formatBPM, modsToString, hitsToString, round } from "./Util";
import Message from "./Message";
import { IDBUser, IDBUserStats } from "./Database";
import IReplay from "./Replay/Replay";

function joinMods(mods: string[]) {
    return (mods.length ? "+" : "") + mods.join('');
}

/**
 * Message template for User command 
 */
export function UserTemplate(server: ServerModule, user: IUserAPIResponse) {
    let { 
        username, id, 
        country, rank, 
        playcount, 
        level, pp, 
        accuracy 
    } = user;
    
    return `
        [Server: ${server.name}]
        Player ${username}
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
export function TopTemplate(server: ServerModule, nickname: string, scores: ITopAPIResponse[], maps: IBeatmap[]) {
    return `
        [Server: ${server.name}]
        Топ скоры игрока ${nickname} [${scores[0].mode}]
        ${scores.map((score, i) => {
            let map = maps[i];
            let length = formatTime(~~(map.length / 1e3));
            let modsString = joinMods(modsToString(score.mods));
            return `${map.title} [${map.version}] ${modsString}
                ${statsToString(map.mode, map.difficulty)} ${round(map.difficulty.stars)}✩
                Grade: ${score.rank} > ${score.maxCombo}x > ${length}
                Accuracy: ${round(score.accuracy * 100)}% > ${hitsToString(score.counts, score.mode)}
                PP: ${score.pp}
                ${score.date.toDateString()}
                ${server.baseLink}b/${score.beatmapId}`;
        }).join("\n")}
    `;
}

/**
 * Message template for Top command with `place` argument
 */
export function TopSingleTemplate(server: ServerModule, nickname: string, score: ITopAPIResponse, place: number, map: IBeatmap) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(score.mods));
    return `
        [Server: ${server.name}]
        Топ #${place} плей игрока ${nickname} (${score.mode})
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        ${score.date.toDateString()}
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
        PP: ${round(pp.pp)} ⯈ FC: ${round(pp.fcpp)} ⯈ SS: ${round(pp.sspp)}
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

        ${score.date}
        Score: ${score.score} | Combo: ${score.maxCombo}x
        Accuracy: ${round(score.accuracy * 100)}%
        PP: ${round(pp.pp)} ⯈ FC: ${round(pp.fcpp)} ⯈ SS: ${round(pp.sspp)}
        Hitcounts: ${hitsToString(score.counts, score.mode)}
        Grade: ${score.rank}
    `;
}

/**
 * Message template for Chat command 
 */
export function ChatTopTemplate(server: ServerModule, message: Message, users: IDBUserStats[]) {
    return `
        [Server: ${server.name}]
        Топ беседы (ID ${message.chatId}):
        ${users.sort((a, b) => b.pp - a.pp).map((u, i) => `
            #${i + 1} ${u.nickname} | ${round(u.pp, 1)} | Ранк ${u.rank} | ${round(u.acc)}%
        `).map(Message.fixString)
            .join('\n')}
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
    `;
}

export function ReplayTemplate(replay: IReplay, map: IBeatmap) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(replay.mods));
    return `
        ${replay.player}'s replay

        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(replay.mode, map.difficulty)} | ${map.difficulty.stars} ${modsString}

        Score: ${replay.score} | Combo: ${replay.combo}x
        Accuracy: ${round(replay.accuracy)}%
        PP: 0 ⯈ FC: 0 ⯈ SS: 0
        Hitcounts: ${hitsToString(replay.counts, replay.mode)}
    `;
}
