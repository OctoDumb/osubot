import { JSDOM } from "jsdom";
import { IBeatmap, IPPResponse } from "../API/MapAPI";
import { IScoreAPIResponse, IUserAPIResponse } from "../API/Osu/APIResponse";
import CardGenerator from "./CardGenerator";

export interface IScoreCardArguments {
    player: IUserAPIResponse;
    recent: IScoreAPIResponse;
    map: IBeatmap;
    pp: IPPResponse;
}

export default class ScoreCardGenerator extends CardGenerator<IScoreCardArguments> {
    protected readonly _name = "score";

    protected transform(dom: JSDOM, data: IScoreCardArguments) {
        
    }
}