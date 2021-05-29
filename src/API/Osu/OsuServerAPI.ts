import md5 from "md5";
import qs from "querystring";
import { getAccuracy } from "../../Util";
import { API, IAPIWithLeaderboard, IAPIWithRecent, IAPIWithScores, IAPIWithTop, IAPIWithUser } from "../ServerAPI";
import { ILeaderboardAPIResponse, IRecentAPIResponse, IScoreAPIResponse, ITopAPIResponse, IUserAPIResponse } from "./APIResponse";
import { ILeaderboardRequestParams, IRecentRequestParams, IScoreRequestParams, ITopRequestParams, IUserRequestParams } from "./RequestParams";

export interface IOsuAPIWithUser extends IAPIWithUser<IUserRequestParams, IUserAPIResponse> {}
export interface IOsuAPIWithTop extends IAPIWithTop<ITopRequestParams, ITopAPIResponse[]> {}
export interface IOsuAPIWithRecent extends IAPIWithRecent<IRecentRequestParams, IRecentAPIResponse[]> {}
export interface IOsuAPIWithScores extends IAPIWithScores<IScoreRequestParams, IScoreAPIResponse[]> {}
export interface IOsuAPIWithLeaderboard extends IAPIWithLeaderboard<ILeaderboardRequestParams, ILeaderboardAPIResponse[]> {}

export interface CachedRequest {
    hash: string;
    data: any;
    expires: number;
}

export class APICache {
    private cached: CachedRequest[] = [];

    constructor() {
        setInterval(() => {
            this.cached = this.cached.filter(c => c.expires > Date.now());
        }, 5000);
    }

    get(hash: string) {
        return this.cached.find(c => c.hash == hash && this.cached);
    }

    set(cached: CachedRequest) {
        let old = this.get(cached.hash);
        if(old?.expires > Date.now()) return;
        this.cached.push(cached);
    }
}

export abstract class OsuAPI extends API implements
    IOsuAPIWithUser,
    IOsuAPIWithTop,
    IOsuAPIWithRecent
{
    protected cache: APICache = new APICache();

    async request(endpoint: string, params: any): Promise<any> {
        let str = `${endpoint}?${qs.stringify(params)}`;
        let hash = md5(str);
        let cached = this.cache.get(hash);
        if(cached) return cached.data;
        let { data } = await this.api.get(str);
        this.cache.set({ hash, data, expires: Date.now() + 5000 });
        return data;
    }

    abstract getUser(params: IUserRequestParams): Promise<IUserAPIResponse>;
    abstract getTop(params: ITopRequestParams): Promise<ITopAPIResponse[]>;
    abstract getRecent(params: IRecentRequestParams): Promise<IRecentAPIResponse[]>;

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

    protected adaptUser(
        userData,
        mode?: string | number
    ): IUserAPIResponse {
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

export abstract class OsuAPIWithScores extends OsuAPI implements
    IOsuAPIWithLeaderboard
{
    abstract getScores(params: IScoreRequestParams): Promise<IScoreAPIResponse[]>;

    async getLeaderboard({
        beatmapId,
        users
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
                            beatmapId
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