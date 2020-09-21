import IServerAPI, { IAPIWithScores, API } from "../ServerAPI";
import Axios from "axios";
import { IUserRequestParams, ITopRequestParams, IRecentRequestParams, IScoreRequestParams, ILeaderboardRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse, IScoreAPIResponse, ILeaderboardAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../APIErrors";

export default class KurikkuAPI extends API implements IServerAPI, IAPIWithScores {
    api = Axios.create({
        baseURL: "https://kurikku.pw/api"
    });

    async getUser({ 
        username, 
        mode = 0 
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let { data: [data] } = await this.api(`/get_user?${stringify({ 
            u: username, 
            m: mode,
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
            m: mode, 
            limit
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
        pass = false 
    }: IRecentRequestParams): Promise<IRecentAPIResponse[]> {
        let { data } = await this.api(`/get_user_recent?${stringify({
            u: username, 
            m: mode, 
            limit: 50
        })}`);

        return data.filter(s => pass ? s.rank != "F" : true).map(d => this.adaptScore(d, mode));
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
            m: mode
        })}`);

        if (mods)
            data = data.filter(p => p.enabled_mods == mods);
        
        return data.map(d => this.adaptScore(d, mode));
    }

    async getLeaderboard({
        beatmapId,
        users,
        mode = 0
    }: ILeaderboardRequestParams): Promise<ILeaderboardAPIResponse[]> {
        let scores: ILeaderboardAPIResponse[] = [];
        try {
            let lim = Math.ceil(users.length / 5);
            for(var i = 0; i < lim; i++) {
                try {
                    let lb: ILeaderboardAPIResponse[] = users.splice(0, 5).map(user => ({ user, scores: [] }));
                    let sc: (IScoreAPIResponse[] | Error | string)[] = await Promise.all(
                        lb.map(u => this.getScores({
                            username: u.user.nickname,
                            beatmapId,
                            mode
                        }).catch(e => e))
                    );
                    for(let j = 0; j < lb.length; j++)
                        lb[j].scores = <IScoreAPIResponse[]>sc[j];
                    scores.push(...lb.filter(s => typeof s.scores != "string" && !(s.scores instanceof Error)))
                } catch(e) {}
            }
        } catch(e) {}

        return scores;
    }
}