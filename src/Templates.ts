import { 
    IUserAPIResponse,
    ITopAPIResponse,
    IRecentAPIResponse, 
    IScoreAPIResponse
} from "./API/Osu/APIResponse";
import ServerModule from "./Commands/Server/ServerModule";
import { IBeatmap, IPPResponse } from "./API/MapAPI";
import { statsToString, formatTime, formatBPM, modsToString, hitsToString, round, formatDate, formatPP, formatChange, formatCombo, modeNumberToString } from "./Util";
import Message from "./Message";
import IReplay from "./Replay/Replay";
import { UsersGetResponse } from "vk-io";
import { IChatTopUser } from "./Modules/ServerCommands/Chat";
import { IV2Beatmapset } from "./API/Osu/Servers/V2/V2Responses";
import { OsuTrackResponse } from "./API/TrackAPI";
import { Status } from "./Database/entity/Status";
import { ILeaderboardEntry } from "./Modules/ServerCommands/Leaderboard";

function joinMods(mods: string[]) {
    return (mods.length ? "+" : "") + mods.join('');
}

/**
 * Message template for User command 
 */
export function UserTemplate(server: ServerModule, user: IUserAPIResponse, mode: number, status: Status) {
    let { 
        username, id, 
        country, rank, 
        playcount, 
        level, pp, 
        accuracy
    } = user;
    
    return `
        [Server: ${server.name}]
        Player ${username} ${status?.emoji ?? ''} [${modeNumberToString(mode)}]
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
export function TopTemplate(server: ServerModule, nickname: string, scores: ITopAPIResponse[], maps: IBeatmap[], status: Status) {
    if(scores.length == 0)
        return "Нет скоров!";
    return `
        [Server: ${server.name}]
        Топ скоры игрока ${nickname} ${status?.emoji ?? ''} [${modeNumberToString(scores[0].mode)}]
        ${scores.map((score, i) => {
            let map = maps[i];
            let length = formatTime(~~(map.length / 1e3));
            let modsString = joinMods(modsToString(score.mods));
            return `#${i+1}
                ${map.title} [${map.version}] ${modsString}
                ${statsToString(map.mode, map.difficulty)} ${round(map.difficulty.stars)}✩
                Grade: ${score.rank.replace('X', 'SS')} ⯈ ${formatCombo(score.maxCombo, map.maxCombo)} ⯈ ${length}
                Accuracy: ${round(score.accuracy * 100)}% ⯈ ${hitsToString(score.counts, score.mode)}
                PP: ${score.pp}
                ${formatDate(score.date)}
                ${server.baseLink}b/${score.beatmapId}
            `;
        }).join("\n")}
    `;
}

/**
 * Message template for Top command with `place` argument
 */
export function TopSingleTemplate(server: ServerModule, nickname: string, score: ITopAPIResponse, place: number, map: IBeatmap, status: Status) {
    let length = formatTime(~~(map.length / 1e3));
    let modsString = joinMods(modsToString(score.mods));
    return `
        [Server: ${server.name}]
        Топ #${place} плей игрока ${nickname} ${status?.emoji ?? ''} (${modeNumberToString(score.mode)}):
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        ${formatDate(score.date)}
        Score: ${score.score} | Combo: ${formatCombo(score.maxCombo, map.maxCombo)}
        Accuracy: ${round(score.accuracy * 100)}%
        Hitcounts: ${hitsToString(score.counts, score.mode)}
        PP: ${score.pp} | Grade: ${score.rank.replace('X', 'SS')}

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
        <${map.status}> ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} BPM: ${formatBPM(map.bpm)} | ${round(map.difficulty.stars)}✩ ${modsString}

        Score: ${recent.score} | Combo: ${formatCombo(recent.maxCombo, map.maxCombo)}
        Accuracy: ${round(recent.accuracy * 100)}%
        ${formatPP(pp)}
        Hitcounts: ${hitsToString(recent.counts, recent.mode)}
        Grade: ${recent.rank.replace('X', 'SS')} ${recent.rank == "F" ? `(${round(pp.progress * 100)}%)` : ''}

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
        Score: ${score.score} | Combo: ${formatCombo(score.maxCombo, map.maxCombo)}
        Accuracy: ${round(score.accuracy * 100)}%
        ${formatPP(pp)}
        Hitcounts: ${hitsToString(score.counts, score.mode)}
        Grade: ${score.rank.replace('X', 'SS')}
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
        ${users.sort((a, b) => b.stats.pp - a.stats.pp).map((u, i) => `#${i + 1} ${u.nickname} ${u.status?.emoji ?? ''} | ${round(u.stats.pp, 1)}pp | Ранк ${u.stats.rank} | ${round(u.stats.accuracy)}%`).map(Message.fixString).join('\n')}
    `;
}

/**
 * Message template for Leaderboard command 
 */
export function LeaderboardTemplate(server: ServerModule, scores: ILeaderboardEntry[], map: IBeatmap) {
    return `
        [Server: ${server.name}]
        Топ беседы на карте ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${scores.map((s, i) => {
            let { user, status, score, pp } = s;
            let modsString = joinMods(modsToString(score.mods));
            return `#${i + 1} ${user.nickname} ${status} | ${score.score} | ${formatCombo(score.maxCombo, map.maxCombo)} | ${round(score.accuracy * 100)}% | ${round(pp)}pp | ${formatDate(score.date)} ${modsString}`;
        }).map(Message.fixString).join('\n')}
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
        ${length} | ${statsToString(replay.mode, map.difficulty)} | ${map.difficulty.stars}✩ ${modsString}

        Score: ${replay.score} | Combo: ${formatCombo(replay.combo, map.maxCombo)}
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
        ${length} | ${statsToString(map.mode, map.difficulty)} | ${map.difficulty.stars}✩ ${modsString}
        Accuracy: ${round(pp.param.acc)}%
        Combo: ${formatCombo(pp.param.combo, map.maxCombo)} | ${pp.param.miss} misses
        - PP: ${round(pp.pp)}
    `;
}

export function MapsetInfoTemplate(set: IV2Beatmapset) {
    return `
        ${set.artist} - ${set.title} by ${set.creator}
        Beatmaps:
        ${set.beatmaps.map((b, i) => {
            let { mode, stars, version } = b;
            let modeString = ["osu", "taiko", "ctb", "mania"][mode];
            return `
                ${i + 1}) ${version} | ${stars}✩ | ${modeString}
            `;
        }).map(Message.fixString).join("\n")}
    `;
}

export function MapInfoTemplate(map: IBeatmap, pp98: IPPResponse, pp99: IPPResponse) {
    let length = formatTime(~~(map.length / 1e3));
    return `
        ${map.artist} - ${map.title} [${map.version}] by ${map.creator}
        ${length} | ${statsToString(map.mode, map.difficulty)} | ${map.difficulty.stars}✩
        PP:
        - ${map.mode == 3 ? '800k' : '98%'} = ${pp98.pp}
        - ${map.mode == 3 ? '900k' : '99%'} = ${pp99.pp}
        - ${map.mode == 3 ? '1kk' : '100%'} = ${pp99.sspp}
    `;
}

export function TrackTemplate(response: OsuTrackResponse) {
    return `
        User ${response.username}:
        Rank: ${formatChange(-response.rank)} (${formatChange(response.pp)} pp) in ${response.playcount} plays
        View detailed data here: https://ameobea.me/osutrack/user/${encodeURI(response.username)}

        ${response.highscores.length == 0 ? '' : `${response.highscores.length} new highscores:\n` 
            + response.highscores.slice(0, 3).map(score => `#${score.place + 1} ${score.pp}pp https://osu.ppy.sh/b/${score.beatmapId}`).join('\n')
            + (response.highscores.length > 3 ? ' and more...' : '')}
    `
}

export function SearchTemplate(maps: IV2Beatmapset[]) {
    return `
        Результат поиска:

        ${maps.splice(0, 10).map(map => `${map.artist} - ${map.title} by ${map.creator} | https://osu.ppy.sh/s/${map.id}`).map(Message.fixString).join("\n")}
    `
}