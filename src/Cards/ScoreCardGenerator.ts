import { JSDOM } from "jsdom";
import { IBeatmap, IPPResponse } from "../API/MapAPI";
import { IScoreAPIResponse, IUserAPIResponse } from "../API/Osu/APIResponse";
import { formatDate, formatTime, modsToString } from "../Util";
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
            .forEach(e => e.setAttribute("style", `background-image: url(https://assets.ppy.sh/beatmaps/${map.beatmapsetID}/covers/raw.jpg)`));
        document.querySelector("#status").innerHTML = map.status;
        document.querySelector("#keys").innerHTML = `${map.difficulty.cs}K`;
        let stats = document.querySelectorAll(".stats__item");
        stats[0].innerHTML = `CS: ${map.difficulty.cs.toFixed(1)}`;
        stats[1].innerHTML = `AR: ${map.difficulty.ar.toFixed(1)}`;
        stats[2].innerHTML = `OD: ${map.difficulty.od.toFixed(1)}`;
        stats[3].innerHTML = `HP: ${map.difficulty.hp.toFixed(1)}`;

        if(score.mode == 3) {
            stats[0].setAttribute("style", "display: none;");
            stats[1].setAttribute("style", "display: none;");
        } else
            document.querySelector("#keys").setAttribute("style", "display: none;");

        document.querySelector(".info__title").innerHTML = map.title;
        document.querySelector(".info__artist").innerHTML = map.artist;

        document.querySelector(".mapper>.nickname").innerHTML = map.creator;
        document.querySelector(".id>.value").innerHTML = String(score.beatmapId);

        document.querySelector(".mode>i").className = "mode-" + ["standard", "taiko", "catch", "mania"][map.mode];
        document.querySelector(".mode>i").setAttribute("style", `color: ${this.getDiffColor(map.difficulty.stars)}`);

        document.querySelector(".map-stats-top__value").innerHTML = map.difficulty.stars.toFixed(2);

        if(map.mode == 3)
            document.querySelectorAll(".map-stats-bottom__item")[0].setAttribute("style", "display: none;");

        stats = document.querySelectorAll(".map-stats-bottom__value");
        stats[0].innerHTML = String(map.maxCombo);
        stats[1].innerHTML = String(map.bpm.avg);
        stats[2].innerHTML = formatTime(~~(map.length / 1e3));

        document.querySelector(".body-container__avatar--img").setAttribute("src", `https://a.ppy.sh/${player.id}?1.jpeg`);
        document.querySelector(".body-container__avatar--flag").setAttribute("style", `background-image: url(https://osu.ppy.sh/assets/images/flags/${this.getCountryCode(player.country)}.svg)`);

        let grade = document.querySelectorAll(".grade>span");
        grade[0].classList.add(score.rank);
        grade[0].innerHTML = this.convertGrade(score.rank);
        grade[1].classList.add(score.rank);
        grade[1].innerHTML = `${Math.round(score.accuracy * 1e4) / 100}%`;

        document.querySelector(".score>.date").innerHTML = `${formatDate(score.date)} <i class="fas fa-calendar-alt"></i>`;
        document.querySelector(".score-value").innerHTML = String(score.score);
        document.querySelector(".score>.combo").innerHTML = `${score.maxCombo}x`;

        let modsContainer = document.querySelector(".score>.mods");

        for(let mod of modsToString(score.mods)) {
            let div = document.createElement("div");
            div.className = `mod ${mod}`;
            div.innerHTML = mod;
            modsContainer.appendChild(div);
        }

        document.querySelector(".body>.nickname").innerHTML = player.username;

        if(score.mods != 3) {
            document.querySelector(".hit-320").setAttribute("style", "display: none;");
            document.querySelector(".hit-200").setAttribute("style", "display: none;");
        }

        document.querySelector(".hit-320>span").innerHTML = String(score.counts.geki);
        document.querySelector(".hit-300>span").innerHTML = String(score.counts[300]);
        document.querySelector(".hit-200>span").innerHTML = String(score.counts.katu);
        document.querySelector(".hit-100>span").innerHTML = String(score.counts[100]);
        document.querySelector(".hit-50>span").innerHTML = String(score.counts[50]);
        document.querySelector(".hit-0>span").innerHTML = String(score.counts.miss);

        let pps = document.querySelectorAll(".pps>*>.value");
        pps[0].innerHTML = String(Math.round(pp.pp));
        pps[1].innerHTML = String(Math.round(pp.fcpp));
        pps[2].innerHTML = String(Math.round(pp.sspp));
    }
}