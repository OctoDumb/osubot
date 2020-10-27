import Axios, { AxiosInstance } from "axios";
import { stringify } from "querystring";

export interface TrackTopScore {
    beatmapId: number
    pp: number
    place: number
}

export interface OsuTrackResponse {
    username: string
    mode: number
    playcount: number
    pp: number
    rank: number
    accuracy: number
    levelup: boolean
    highscores: TrackTopScore[]
}

export default class TrackAPI {
    api: AxiosInstance = Axios.create({
        baseURL: "https://ameobea.me/osutrack/api",
        timeout: 20000
    });

    async getChanges(nickname: string, mode: number): Promise<any> {
        let { data } = await this.api.get(`/get_changes.php?${stringify({ user: nickname, mode })}`);
        
        return {
            username: data.username,
            mode: data.mode,
            playcount: data.playcount,
            pp: data.pp_raw,
            rank: data.pp_rank,
            accuracy: data.accuracy,
            levelup: data.levelup,
            highscores: data.newhs.map(s => ({
                beatmapId: Number(s.beatmap_id),
                pp: Number(s.pp),
                place: s.ranking
            }))
        }
    }
}