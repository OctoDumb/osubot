import { JSDOM } from "jsdom";
import { IBeatmap } from "../API/MapAPI";
import { ITopAPIResponse, IUserAPIResponse } from "../API/Osu/APIResponse";
import CardGenerator from "./CardGenerator";

export interface ITopCardArguments {
    player: IUserAPIResponse,
    top: ITopAPIResponse[],
    maps: IBeatmap[]
}

export default class TopCardGenerator extends CardGenerator<ITopCardArguments> {
    constructor() { super("top") }

    protected transform(dom: JSDOM, { player, top, maps }: ITopCardArguments) {
        let { document } = dom.window;

        document.querySelector(".info>.left").setAttribute("style", `background-image: url(https://a.ppy.sh/${player.id}?1.jpeg);`)
        document.querySelector(".nickname").innerHTML = player.username;
        document.querySelector(".flag").setAttribute("style", `background-image: url(https://osu.ppy.sh/assets/images/flags/${this.getCountryCode(player.country)}.svg);`);

        document.querySelector(".mode>i").className = "mode-" + ["standard", "taiko", "catch", "mania"][top[0].mode];
        let items = top.map((t, i) => {
            let item = document.createElement("div");
            item.className = "item";

            let body = document.createElement("div");
            body.className = "body";
                let grade = document.createElement("div");
                grade.className = `grade ${t.rank}`
                grade.innerHTML = `<span class="${t.rank}">${this.convertGrade(t.rank)}</span>`;
                let info = document.createElement("div");
                info.className = "info";
                    let title = document.createElement("span");
                    title.className = "info__title";
                    title.innerHTML = `${maps[i].title} by ${maps[i].creator}`;
                    let diffname = document.createElement("span");
                    diffname.className = "info__dif";
                    diffname.innerHTML = maps[i].version;
                    info.append(title, diffname);
                let pp = document.createElement("div");
                pp.className = "pp"
                pp.innerHTML = `<span class="value">${Math.round(t.pp)}</span>PP`;
                let bg = document.createElement("div");
                bg.className = "background";
                bg.setAttribute("style", `background-image: url(https://assets.ppy.sh/beatmaps/${maps[i].beatmapsetID}/covers/cover.jpg);`);
                body.append(grade, info, pp, bg);
            
            let weight = document.createElement("div");
            weight.className = "weight";
            weight.innerHTML = `${Math.round(Math.pow(0.95, i) * 100)}%`;

            item.append(body, weight);

            return item;
        });

        document.querySelector(".items").innerHTML = "";
        document.querySelector(".items").append(...items);
    }
}