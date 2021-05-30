import {AxiosResponse} from "axios";

export interface ICachedRequest {
    hash: string;
    data: any;
    expires: number;
}

export interface IInProgressRequest {
    hash: string;
    promise: Promise<AxiosResponse<any>>;
}

export class APICache {
    private cached: ICachedRequest[] = [];
    private inProgress: IInProgressRequest[] = [];

    constructor() {
        setInterval(() => {
            this.cached = this.cached.filter(c => c.expires > Date.now());
        }, 5000);
    }

    get(hash: string) {
        return this.cached.find(c => c.hash == hash && this.cached);
    }

    set(cached: ICachedRequest) {
        let old = this.get(cached.hash);
        if(old?.expires > Date.now()) return;
        this.cached.push(cached);
    }

    getInProgress(hash: string): IInProgressRequest {
        return this.inProgress.find(c => c.hash == hash && this.inProgress);
    }

    setInProgress(inProgress: IInProgressRequest) {
        let old = this.get(inProgress.hash);
        if(old) return;
        this.inProgress.push(inProgress);
    }

    removeInProgress(hash: string) {
        this.inProgress = this.inProgress.filter(c => c.hash == hash);
    }
}