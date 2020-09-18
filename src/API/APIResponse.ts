import { IDBUser } from "../Database";
import { IBeatmap } from "./MapAPI";

export interface IUserAPIResponse {
    id: number,
    username: string,
    playcount: number,
    pp: number,
    rank: {
        total: number,
        country: number,
    },
    country: string,
    accuracy: number,
    level: number
}

export interface ITopAPIResponse extends IScoreAPIResponse {
    pp: number
}

export interface IRecentAPIResponse extends IScoreAPIResponse {}

export interface IHitCounts {
    300: number,
    100: number,
    50: number,
    geki: number,
    katu: number,
    miss: number
}

export interface IScoreAPIResponse {
    beatmapId: number,
    mode: number,
    score: number,
    maxCombo: number,
    counts: IHitCounts,
    mods: number,
    rank: string,
    date: Date,
    accuracy: number
}

export interface ILeaderboardAPIResponse {
    user: IDBUser,
    scores: IScoreAPIResponse[]
}