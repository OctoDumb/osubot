import Axios, { AxiosInstance } from "axios";
import { stringify } from "querystring";
import { IV2News } from "./V2/V2Responses";

export default class BanchoV2API {
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
            client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACCAJpQtw6OXk",
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