import { ServerConnection } from "@prisma/client";

export interface IUserRequestParams {
    username: string;
    mode?: number;
}

export interface ITopRequestParams {
    username: string;
    mode?: number;
    limit?: number;
}

export interface IRecentRequestParams {
    username: string;
    mode?: number;
    limit?: number;
    pass?: boolean;
}

export interface IScoreRequestParams {
    username: string;
    beatmapId: number;
    mode?: number;
    mods?: number;
}

export interface ILeaderboardRequestParams {
    beatmapId: number;
    users: ServerConnection[];
    mods?: number;
}