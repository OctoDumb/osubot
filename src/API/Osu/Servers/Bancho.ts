import { IUserRequestParams, ITopRequestParams, IRecentRequestParams, IScoreRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse, IScoreAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../../APIErrors";
import Axios from "axios";
import {
    IOsuAPIWithLeaderboard,
    IOsuAPIWithRecent,
    IOsuAPIWithScores,
    IOsuAPIWithTop,
    IOsuAPIWithUser,
    OsuAPIWithScores
} from "../OsuServerAPI";

export interface IBanchoAPI extends
    IOsuAPIWithUser,
    IOsuAPIWithTop,
    IOsuAPIWithRecent,
    IOsuAPIWithScores,
    IOsuAPIWithLeaderboard
{}

export default class BanchoAPI extends OsuAPIWithScores implements IBanchoAPI {
    name = "Bancho";
    api = Axios.create({
        baseURL: "https://osu.ppy.sh/api"
    });

    constructor(
        private token: string
    ) {
        super();
    }

    async getUser({ 
        username, 
        mode = 0
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let [ data ] = await this.request('/get_user', {
            k: this.token,
            u: username,
            m: mode ?? 0
        });
        if(!data)
            throw new APINotFoundError("User is not found!");
        
        return this.adaptUser(data);
    }

    async getTop({ 
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let data = await this.request('/get_user_best', {
            k: this.token,
            u: username,
            m: mode ?? 0
        });

        return data.map(s => Object.assign(
            this.adaptScore(s, mode ?? 0), 
            { 
                pp: Number(s.pp) 
            }
        ));
    }

    async getRecent({ 
        username, 
        mode = 0, 
        pass = false 
    }: IRecentRequestParams): Promise<IRecentAPIResponse[]> {
        let { data } = await this.api(`/get_user_recent?${stringify({
            k: this.token,
            u: username, 
            m: mode ?? 0,
            limit: 50
        })}`);

        return data.filter(s => pass ? s.rank != "F" : true).map(d => this.adaptScore(d, mode ?? 0));
    }

    async getScores({
        username,
        beatmapId,
        mode = 0,
        mods = null
    }: IScoreRequestParams): Promise<IScoreAPIResponse[]> {
        let { data } = await this.api(`/get_scores?${stringify({
            k: this.token,
            u: username,
            b: beatmapId,
            m: mode ?? 0
        })}`);

        if (mods != null)
            data = data.filter(p => p.enabled_mods == mods);
        
        return data.map(d => this.adaptScore(d, mode ?? 0));
    }
}