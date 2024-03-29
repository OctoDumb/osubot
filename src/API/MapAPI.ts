import Axios, { AxiosInstance } from "axios";
import * as qs from "querystring";
import Logger, { LogLevel } from "../Logger";
import MapAPIError from "../Errors/MapAPI";

export interface IBeatmap {
    title: string
    artist: string
    creator: string
    version: string
    beatmapsetID: number
    maxCombo: number
    status: string
    mode: number
    difficulty: {
        ar: number
        cs: number
        hp: number
        od: number
        stars: number
    }
    bpm: {
        min: number
        max: number
        avg: number
    }
    length: number
}

export interface IPPResponse {
    pp: number
    fcpp: number
    sspp: number
    progress: number
    param: {
        combo: number
        miss: number
        acc: number
        score: number
    }
}

export interface IAPIBeatmapRequest {
    id: number
    hash: string
}

export default class MapAPI {
    api: AxiosInstance
    constructor(
        private port: number
    ) {
        this.api = Axios.create({
            baseURL: `http://localhost:${this.port}`
        });
    }

    async getStatus(): Promise<any> {
        let { data } = await this.api('/');
        return data;
    }

    async getBeatmapIdFromHash(hash: string): Promise<number> {
        let { data } = await this.api(`/api/getBeatmap?${qs.stringify({ hash })}`);
        return Number(data.beatmap_id)
    }

    async getBeatmap(id: number, mods?: string[]): Promise<IBeatmap> {
        let { data } = await this.api(`/getBeatmap?${qs.stringify({ id, mods: mods?.join(",") })}`);
        if(data.error)
            throw new MapAPIError(`${data.error} (${JSON.stringify(data.data ?? {})})`);
        return data;
    }

    async getPP(id: number, args?: IPPArguments): Promise<IPPResponse> {
        Logger.debug(`[MapAPI] PPArguments: ${JSON.stringify(args)}`);
        let { data } = await this.api(`/getScorePP?${qs.stringify({ id, ...args })}`);
        if(data.error)
            throw new MapAPIError(`${data.error} (${JSON.stringify(data.data ?? {})})`);
        Logger.debug(`[MapAPI] PPResponse: ${JSON.stringify(data)}`);
        return data;
    }
}

interface IPPArguments {
    combo?: number;
    miss?: number;
    n50?: number;
    acc?: number;
    score?: number;
    mods?: string
    fail?: number;
}