import IServerAPI, { IAPIWithScores, API } from "../ServerAPI";
import Axios from "axios";
import { IUserRequestParams, ITopRequestParams, IRecentRequestParams, IScoreRequestParams, ILeaderboardRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse, IScoreAPIResponse, ILeaderboardAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../APIErrors";
import { getAccuracy } from "../../Util";

export default class GatariAPI extends API implements IServerAPI, IAPIWithScores {
    api = Axios.create({
        baseURL: "https://api.gatari.pw"
    });

    async getUser({ 
        username, 
        mode = 0
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let { data: { users } } = await this.api.get(`/users/get?${stringify({ u: username })}`);
        let { data: { stats } } = await this.api.get(`/user/stats?${stringify({ u: username, mode })}`);
        
        if(!users[0] || !stats)
            throw new APINotFoundError("User is not found!");

        let data = { ...users[0], ...stats };
        
        return this.adaptUser(data);
    }

    async getTop({ 
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let user = await this.getUser({ username, mode });
        let { data } = await this.api.get(`/user/scores/best?${stringify({
            id: user.id, 
            mode, 
            p: 1, 
            l: limit
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
        let user = await this.getUser({ username, mode });
        let { data } = await this.api.get(`/user/scores/recent?${stringify({
            id: user.id, 
            mode, 
            p: 1, 
            l: 50,
            f: 1
        })}`);

        return data.scores.filter(s => pass ? s.ranking != "F" : true).map(d => this.adaptScore(d, mode));
    }

    async getScores({
        username,
        beatmapId,
        mode = 0,
        mods = null
    }: IScoreRequestParams): Promise<IScoreAPIResponse[]> {
        let user = await this.getUser({ username, mode });
        let { data } = await this.api.get(`/beatmap/user/score?${stringify({
            b: beatmapId, 
            u: user.id, 
            mode
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

    protected adaptScore(
        scoreData, 
        mode: number
    ): IScoreAPIResponse {
        //console.log(scoreData)
        let counts = {
            300: Number(scoreData.count_300),
            100: Number(scoreData.count_100),
            50: Number(scoreData.count_50),
            geki: Number(scoreData.count_gekis),
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
            rank: scoreData.ranking,
            date: new Date(scoreData.time),
            accuracy: getAccuracy(mode, counts)
        }
    }

    protected adaptUser(
        userData
    ): IUserAPIResponse {
        return {
            id: Number(userData.id),
            username: userData.username,
            playcount: Number(userData.playcount),
            pp: Number(userData.pp),
            rank: {
                total: Number(userData.rank),
                country: Number(userData.country_rank)
            },
            country: userData.country,
            accuracy: Number(userData.avg_accuracy),
            level: Number(userData.level)
        }
    }
}