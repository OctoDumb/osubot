import { ITopRequestParams, IRecentRequestParams } from "../RequestParams";
import { ITopAPIResponse, IRecentAPIResponse } from "../APIResponse";
import { stringify } from "querystring";
import AkatsukiAPI, { IAkatsukiAPI } from "./Akatsuki";

export interface IAkatsukiRelaxAPI extends IAkatsukiAPI {

}

export default class AkatsukiRelaxAPI extends AkatsukiAPI implements IAkatsukiAPI {
    name = "Akatsuki relax";

    async getTop({
        username, 
        mode = 0, 
        limit = 3 
    }: ITopRequestParams): Promise<ITopAPIResponse[]> {
        let { data } = await this.api.get(`/users/scores/best?${stringify({ 
            name: username, 
            mode: mode ?? 0, 
            l: limit, 
            rx: 1
        })}`);

        return data.map(s => Object.assign(
            this.adaptScore(s, mode ?? 0), 
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
            mode: mode ?? 0, 
            l: 50, 
            rx: 1
        })}`);

        return data.map(d => this.adaptScore(d, mode ?? 0));
    }
}