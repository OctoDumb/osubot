import Axios, { AxiosInstance } from "axios";
import { EventEmitter } from "eventemitter3";
import { stringify } from "querystring";
import { IChangelogRequest, IV2BeatmapsetsRequest, IV2BeatmapsetRequest, IV2BeatmapRequest } from "./V2/V2Request";
import { IChangelog, IV2Beatmapset, IV2Beatmap, IV2News } from "./V2/V2Responses";

type APIV2Events = {
    ['osuupdate']: [IChangelog],
    ['newranked']: [IV2Beatmapset],
    ['osunews']: [IV2News]
}

interface IV2Data {
    lastBuild: number;
    lastRanked: number;
    lastNews: number;
}

class BanchoV2Data extends EventEmitter<APIV2Events> {
    data: IV2Data = {
        lastBuild: Infinity,
        lastRanked: Infinity,
        lastNews: Infinity
    };

    constructor(
        private api: BanchoV2API
    ) {
        super();
    }

    start() {
        setInterval(() => this.update(), 5000);
    }

    private async update() {
        await this.updateChangelog();
        await this.updateRanked();
        await this.updateNews();
    }

    async updateChangelog() {
        let build = (await this.api.getChangelog({}))[0];
        if(this.data.lastBuild == Infinity)
            this.data.lastBuild = build.id;
        else if(build.id > this.data.lastBuild) {
            this.data.lastBuild = build.id;
            this.emit('osuupdate', build);
        }
    }

    async updateRanked() {
        let data = await this.api.getBeatmapsets({});
        if(this.data.lastRanked == Infinity)
            this.data.lastRanked = data[0].rankedDate.getTime();
        else {
            data = data.filter(s => s.rankedDate.getTime() > this.data.lastRanked);
            if(!data.length)
            for(let set of data) {
                this.emit('newranked', set);
            }
            this.data.lastRanked = data[0].rankedDate.getTime();
        }
    }

    async updateNews() {
        let data = await this.api.getNews();
        if(this.data.lastNews == Infinity)
            this.data.lastNews = data.date.getTime();
        else if(this.data.lastNews < data.date.getTime()) {
            this.data.lastNews = data.date.getTime();
            this.emit('osunews', data);
        }
    }
}

export default class BanchoV2API {
    data = new BanchoV2Data(this);

    private access_token: string;
    private refresh_token: string;
    private api: AxiosInstance = Axios.create({
        baseURL: "https://osu.ppy.sh/api/v2",
        timeout: 1e4
    });

    async login(username: string, password: string) {
        let { data } = await Axios.post("https://osu.ppy.sh/oauth/token", {
            username,
            password,
            grant_type: "password",
            client_id: 5,
            client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
            scope: "*"
        });

        if(!data.access_token)
            throw "Bancho V2 API unautorized!";

        this.access_token = data.access_token;
        this.refresh_token = data.refresh_token;
    }

    async refresh() {
        if(!this.access_token)
            throw "Not logged in";
        let { data } = await Axios.post("https://osu.ppy.sh/oauth/token", {
            client_id: 5,
            client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACCAJpQtw6OXk",
            grant_type: "refresh_token",
            refresh_token: this.refresh_token,
            scope: "*"
        });
        this.access_token = data.access_token;
        this.refresh_token = data.refresh_token;
    }

    async request(method: string, query?: {[key: string]: any}) {
        try {
            let { data } = await this.api.get(`${method}${query ? '?' + stringify(query) : ''}`, {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`
                }
            });
            return data;
        } catch(e) {
            if(e.response?.status == 401) {
                await this.refresh();
                return this.request(method, query);
            }
            throw e;
        }
    }

    async getChangelog({ stream, limit }: IChangelogRequest): Promise<IChangelog[]> {
        let data = (await this.request('/changelog', { stream: stream ?? "stable40", limit })).builds;
        return data.map(build => ({
            id: build.id,
            version: build.version,
            entries: build.changeLog_entries.map(entry => ({
                category: entry.category,
                title: entry.title,
                isMajor: entry.major
            }))
        }));
    }

    async getBeatmapset({ beatmapsetId }: IV2BeatmapsetRequest): Promise<IV2Beatmapset> {
        let data = await this.request(`/beatmapsets/${beatmapsetId}`);
        return {
            id: data.id,
            title: data.title,
            artist: data.artist,
            rankedDate: new Date(data.ranked_date),
            creator: data.creator,
            status: data.status,
            beatmaps: data.beatmaps.map(map => ({
                id: map.id,
                mode: map.mode_int,
                stars: map.difficulty_rating,
                version: map.version
            }))
        }
    }

    async getBeatmapsets({ query, status }: IV2BeatmapsetsRequest): Promise<IV2Beatmapset[]> {
        let data = await this.request('/beatmapsets/search/', { q: query ?? null, s: status ?? 'ranked' });
        return data.beatmapsets.map(set => ({
            id: set.id,
            title: set.title,
            artist: set.artist,
            rankedDate: new Date(set.ranked_date),
            creator: set.creator,
            status: set.status,
            beatmaps: set.beatmaps.map(map => ({
                id: map.id,
                mode: map.mode_int,
                stars: map.difficulty_rating,
                version: map.version
            }))
        }));
    }

    async getNews(): Promise<IV2News> {
        let data = (await this.request('/news')).news_posts[0];
        return {
            id: data.id,
            author: data.author,
            image: data.first_image.startsWith("/") ? "https://osu.ppy.sh" : "" + data.first_image,
            title: data.title,
            link: "https://osu.ppy.sh/home/news/" + data.slug,
            date: new Date(data.published_at)
        }
    }
}