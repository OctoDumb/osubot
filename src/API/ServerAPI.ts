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