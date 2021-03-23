import { APIWithScores } from "../ServerAPI";
import { IUserRequestParams, ITopRequestParams, IRecentRequestParams, IScoreRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse, IScoreAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../APIErrors";
import Axios from "axios";

export default class KurikkuAPI extends APIWithScores {
    api = Axios.create({
        baseURL: "https://kurikku.pw/api"
    });

    async getUser({ 
        username, 
        mode = 0 
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let { data: [data] } = await this.api(`/get_user?${stringify({ 
            u: username, 
            m: mode ?? 0,
        })}`);
        
        if(!data)
            throw new APINotFoundError("User is not found!");
        
        return this.adaptUser(data);
    }

    async getTop({ 
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let { data } = await this.api(`/get_user_best?${stringify({ 
            u: username, 
            m: mode ?? 0, 
            limit
        })}`);

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
            u: username,
            b: beatmapId,
            m: mode ?? 0
        })}`);

        if (mods != null)
            data = data.filter(p => p.enabled_mods == mods);
        
        return data.map(d => this.adaptScore(d, mode ?? 0));
    }
}