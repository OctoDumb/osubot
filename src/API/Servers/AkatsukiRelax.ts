import { ITopRequestParams, IRecentRequestParams } from "../RequestParams";
import { ITopAPIResponse, IRecentAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import AkatsukiAPI from "./Akatsuki";

export default class AkatsukiRelaxAPI extends AkatsukiAPI{
    async getTop({
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let { data } = await this.api.get(`/users/scores/best?${stringify({ 
            name: username, 
            mode: mode, 
            l: limit, 
            rx: 1
        })}`);

        return data.map(s => Object.assign(
            this.adaptScore(s, mode), 
            { 
                pp: Number(s.pp) 
            }
        ));
    }

    async getRecent({
        username, 
        mode = 0, 
    }: IRecentRequestParams): Promise<IRecentAPIResponse[]> {
        let { data } = await this.api.get(`/users/scores/recent?${stringify({
            name: username, 
            mode, 
            l: 50, 
            rx: 1
        })}`);

        return data.map(d => this.adaptScore(d, mode));
    }
}