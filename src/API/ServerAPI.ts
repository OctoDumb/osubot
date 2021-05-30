import {AxiosInstance, AxiosResponse} from "axios";
import qs from "querystring";
import md5 from "md5";
import {APICache} from "./APICache";

export interface IAPIWithUser<T, Response> {
    getUser: (params: T) => Promise<Response>;
}

export interface IAPIWithTop<T, Response> {
    getTop: (params: T) => Promise<Response>;
}

export interface IAPIWithRecent<T, Response> {
    getRecent: (params: T) => Promise<Response>;
}

export interface IAPIWithScores<T, Response> {
    getScores: (params: T) => Promise<Response>;
}

export interface IAPIWithLeaderboard<T, Response> {
    getLeaderboard: (params: T) => Promise<Response>;
}

export abstract class API {
    abstract name: string;
    abstract api: AxiosInstance;

    protected cache: APICache = new APICache();

    protected async request(endpoint: string, params: any): Promise<any> {
        let url = `${endpoint}?${qs.stringify(params)}`;
        let hash = md5(url);
        let inProgress = this.cache.getInProgress(hash);

        if (inProgress) {
            const { data } = await inProgress.promise;
            return data;
        } else {
            let cached = this.cache.get(hash);

            if(cached) return cached.data;

            let promise = this.api.get(url);
            this.cache.setInProgress({ hash, promise });
            let { data } = await promise;
            this.cache.removeInProgress(hash);
            this.cache.set({ hash, data, expires: Date.now() + 5000 });

            return data;
        }
    }
}