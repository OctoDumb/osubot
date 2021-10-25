import { JSDOM } from "jsdom";
import { IUserAPIResponse } from "../API/Osu/APIResponse";
import CardGenerator from "./CardGenerator";

export interface IUserCardArguments {
    player: IUserAPIResponse;
}

export default class UserCardGenerator extends CardGenerator<IUserCardArguments> {
    constructor() { super("user") }

    protected transform(dom: JSDOM, { player }: IUserCardArguments) {
        let { document } = dom.window;
        document.querySelector(".avatar").setAttribute("style", `background-image: url('https://a.ppy.sh/${player.id}?1.jpeg')`);
        document.querySelector(".nickname").innerHTML = player.username;
        
        document.querySelector("#worldrank>.place").innerHTML = `#${this.separateNumber(player.rank.total)}`;
        document.querySelector("#countryrank>.place").innerHTML = `#${this.separateNumber(player.rank.country)}`;

        document.querySelector("#countryrank>.flag").setAttribute("style", `background-image: url(https://osu.ppy.sh/assets/images/flags/${this.getCountryCode(player.country)}.svg)`);

        let grades = document.querySelectorAll(".grade>.item>.amount");
        // grades[0].innerHTML = this.separateNumber(player.grades.A)

        document.querySelector(".pp>.value").innerHTML = this.separateNumber(Math.round(player.pp));
    }
}