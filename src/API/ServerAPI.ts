import { AxiosInstance } from "axios";
import { 
    IUserRequestParams,
    ITopRequestParams,
    IRecentRequestParams,
    IScoreRequestParams,
    ILeaderboardRequestParams
} from "./RequestParams";
import {
    IUserAPIResponse,
    ITopAPIResponse,
    IRecentAPIResponse,
    IScoreAPIResponse,
    ILeaderboardAPIResponse
} from "./APIResponse";
import { getAccuracy } from "../Util";

export default interface IServerAPI {
    api: AxiosInstance;
    getUser(params: IUserRequestParams): Promise<IUserAPIResponse>;
    getTop(params: ITopRequestParams): Promise<ITopAPIResponse[]>;
    getRecent(params: IRecentRequestParams): Promise<IRecentAPIResponse[]>;
}

export interface IAPIWithScores extends IServerAPI {
    getScores(params: IScoreRequestParams): Promise<IScoreAPIResponse[]>;
    getLeaderboard(params: ILeaderboardRequestParams): Promise<ILeaderboardAPIResponse[]>;
}

export abstract class API {
    protected adaptScore(
        scoreData, 
        mode: number
    ): IScoreAPIResponse {
        let counts = {
            300: Number(scoreData.count300),
            100: Number(scoreData.count100),
            50: Number(scoreData.count50),
            geki: Number(scoreData.countgeki),
            katu: Number(scoreData.countkatu),
            miss: Number(scoreData.countmiss)
        };
        
        return {
            beatmapId: Number(scoreData.beatmap_id),
            mode,
            score: Number(scoreData.score),
            maxCombo: Number(scoreData.maxcombo),
            counts,
            mods: Number(scoreData.enabled_mods),
            rank: scoreData.rank,
            date: new Date(scoreData.date),
            accuracy: getAccuracy(mode, counts)
        }
    }

    protected adaptUser(userData): IUserAPIResponse {
        return {
            id: Number(userData.user_id),
            username: userData.username,
            playcount: Number(userData.playcount),
            pp: Number(userData.pp_raw),
            rank: {
                total: Number(userData.pp_rank),
                country: Number(userData.pp_country_rank)
            },
            country: userData.country,
            accuracy: Number(userData.accuracy),
            level: Number(userData.level)
        }
    }
}