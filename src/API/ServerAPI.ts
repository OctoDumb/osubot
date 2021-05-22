import { AxiosInstance } from "axios";

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
}