import IServerAPI, { API } from "../ServerAPI";
import Axios from "axios";
import { IUserRequestParams, ITopRequestParams, IRecentRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../APIErrors";
import { getAccuracy } from "../../Util";

export default class AkatsukiAPI extends API implements IServerAPI {
    api = Axios.create({
        baseURL: "https://akatsuki.pw/api/v1"
    });

    async getUser({
        username,
        mode = 0
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let { data } = await this.api.get(`/users/full?${stringify({ name: username })}`);
        let m = ["std", "taiko", "ctb", "mania"][mode];

        if(!data)
            throw new APINotFoundError("User is not found!");

        return this.adaptUser(data, m);
    }

    async getTop({
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let { data } = await this.api.get(`/users/scores/best?${stringify({ 
            name: username, 
            mode: mode, 
            l: limit, 
            rx: 0
        })}`);

        return data.map(s => Object.assign(
            this.adaptScore(s, mode), 
            { 
                pp: Number(s.pp) 
            }
        ));
    }

    async getRecent({
        username, 
        mode = 0, 
    }: IRecentRequestParams): Promise<IRecentAPIResponse[]> {
        let { data } = await this.api.get(`/users/scores/recent?${stringify({
            name: username, 
            mode, 
            l: 50, 
            rx: 0
        })}`);

        return data.map(d => this.adaptScore(d, mode));
    }

    protected adaptScore(
        scoreData,
        mode
    ): IRecentAPIResponse {
        let counts = {
            300: Number(scoreData.count_300),
            100: Number(scoreData.count_100),
            50: Number(scoreData.count_50),
            geki: Number(scoreData.count_geki),
            katu: Number(scoreData.count_katu),
            miss: Number(scoreData.count_miss)
        };
        
        return {
            beatmapId: Number(scoreData.beatmap.beatmap_id),
            mode,
            score: Number(scoreData.score),
            maxCombo: Number(scoreData.max_combo),
            counts,
            mods: Number(scoreData.mods),
            rank: scoreData.rank,
            date: new Date(scoreData.date),
            accuracy: getAccuracy(mode, counts)
        }
    }

    protected adaptUser(
        userData,
        mode
    ): IUserAPIResponse {
        return {
            id: Number(userData.id),
            username: userData.username,
            playcount: Number(userData.stats[0][mode].playcount),
            pp: Number(userData.stats[0][mode].pp),
            rank: {
                total: Number(userData.stats[0][mode].global_leaderboard_rank),
                country: Number(userData.stats[0][mode].country_leaderboard_rank)
            },
            country: userData.country,
            accuracy: Number(userData.stats[0][mode].accuracy),
            level: Number(userData.stats[0][mode].level)
        }
    }
}