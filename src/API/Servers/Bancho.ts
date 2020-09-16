import IServerAPI, { IAPIWithScores } from "../ServerAPI";
import Axios from "axios";
import { IUserRequestParams, ITopRequestParams, IRecentRequestParams, IScoreRequestParams } from "../RequestParams";
import { IUserAPIResponse, ITopAPIResponse, IRecentAPIResponse, IScoreAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import { APINotFoundError } from "../APIErrors";
import { getAccuracy } from "../../Util";

export default class BanchoAPI implements IServerAPI {
    api = Axios.create({
        baseURL: "https://osu.ppy.sh/api"
    });

    constructor(
        private token: string
    ) {}

    async getUser({ 
        username, 
        mode = 0 
    }: IUserRequestParams): Promise<IUserAPIResponse> {
        let { data: [data] } = await this.api(`/get_user?${stringify({ 
            k: this.token,
            u: username, 
            m: mode,
        })}`);
        if(!data)
            throw new APINotFoundError("User is not found!");
        return {
            id: Number(data.user_id),
            username: data.username,
            playcount: Number(data.playcount),
            pp: Number(data.pp_raw),
            rank: {
                total: Number(data.pp_rank),
                country: Number(data.pp_country_rank)
            },
            country: data.country,
            accuracy: Number(data.accuracy),
            level: Number(data.level)
        }
    }

    async getTop({ 
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let { data } = await this.api(`/get_user_best?${stringify({ 
            k: this.token,
            u: username, 
            m: mode, 
            limit
        })}`);

        return data.map(s => {
            let counts = {
                300: Number(s.count300),
                100: Number(s.count100),
                50: Number(s.count50),
                geki: Number(s.countgeki),
                katu: Number(s.countkatu),
                miss: Number(s.countmiss)
            };
            return {
                beatmapId: Number(s.beatmap_id),
                mode: mode ?? 0,
                score: Number(s.score),
                maxCombo: Number(s.maxcombo),
                counts,
                mods: Number(s.enabled_mods),
                rank: s.rank,
                date: new Date(s.date),
                accuracy: getAccuracy(mode, counts),
                pp: Number(s.pp)
            }
        });
    }

    async getRecent({ 
        username, 
        mode = 0, 
        pass = false 
    }: IRecentRequestParams): Promise<IRecentAPIResponse[]> {
        let { data } = await this.api(`/get_user_recent?${stringify({
            k: this.token,
            u: username, 
            m: mode, 
            limit: 50
        })}`);

        return data.filter(s => pass ? s.rank != "F" : true).map(d => this.adaptScore(d, mode));
    }

    async getScore({
        username,
        beatmapId,
        mode = 0,
        mods = null
    }: IScoreRequestParams): Promise<IScoreAPIResponse> {
        let { data } = await this.api(`/get_scores?${stringify({
            k: this.token,
            u: username,
            b: beatmapId,
            m: mode
        })}`);

        if (!mods)
            data = data.filter(p => p.enabled_mods == mods);
        
        return this.adaptScore(data, mode);
    }

    private adaptScore(
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
}