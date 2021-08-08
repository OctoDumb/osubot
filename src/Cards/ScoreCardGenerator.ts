import { JSDOM } from "jsdom";
import { IBeatmap, IPPResponse } from "../API/MapAPI";
import { IScoreAPIResponse, IUserAPIResponse } from "../API/Osu/APIResponse";
import CardGenerator from "./CardGenerator";

export interface IScoreCardArguments {
    player: IUserAPIResponse;
    score: IScoreAPIResponse;
    map: IBeatmap;
    pp: IPPResponse;
}

export default class ScoreCardGenerator extends CardGenerator<IScoreCardArguments> {
    constructor() { super("score") }

    protected transform(dom: JSDOM, { player, score, map, pp }: IScoreCardArguments) {
        let { document } = dom.window;
        document.querySelectorAll(".background")
            .forEach(e => e.setAttribute("style", `background-image: url(https://assets.ppy.sh/beatmaps/${map.beatmapsetID}/covers/cover.jpg)`));
        document.querySelector("#status").innerHTML = map.status;
        document.querySelector("#keys").innerHTML = `${map.difficulty.cs}K`;
        let stats = document.querySelectorAll(".stats>div");
        stats[0].innerHTML = `CS: ${map.difficulty.cs.toFixed(1)}`;
        stats[1].innerHTML = `AR: ${map.difficulty.ar.toFixed(1)}`;
        stats[2].innerHTML = `OD: ${map.difficulty.od.toFixed(1)}`;
        stats[3].innerHTML = `HP: ${map.difficulty.hp.toFixed(1)}`;

        if(score.mode == 3) {
            stats[0].setAttribute("style", "display: none;");
            stats[1].setAttribute("style", "display: none;");
        } else {
            document.querySelector("#keys").setAttribute("style", "display: none;");
        }

        document.querySelector(".title").innerHTML = map.title;
        document.querySelector(".artist").innerHTML = map.artist;

        document.querySelector(".mapper>.nickname").innerHTML = map.creator;
        document.querySelector(".id>.value").innerHTML = String(score.beatmapId);

        document.querySelector(".mode>i").setAttribute("style", `color: ${this.getDiffColor(map.difficulty.stars)}`);
    }
}