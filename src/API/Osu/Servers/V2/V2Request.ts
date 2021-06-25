export interface IChangelogRequest {
    stream?: string;
    limit?: number;
}

export interface IV2BeatmapsetRequest {
    beatmapsetId: number;
}

export interface IV2BeatmapsetsRequest {
    query?: string;
    status?: string;
    limit?: number;
}