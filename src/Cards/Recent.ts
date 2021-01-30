import Card from "./Card";
import { IRecentAPIResponse } from "../API/APIResponse";
import { IBeatmap, IPPResponse } from "../API/MapAPI";
import { access } from "fs";

export interface IRecentCardArgs {
    playerId: number;
    username: string;
    recent: IRecentAPIResponse;
    map: IBeatmap;
    pp: IPPResponse;
}

export default class RecentCard extends Card<IRecentCardArgs> {
    private modifyHeader(cardData: IRecentCardArgs) {
        this.document.querySelector(".beatmap-header__bg").setAttribute("style", `background-image: url(https://assets.ppy.sh/beatmaps/${cardData.map.beatmapsetID}/covers/cover.jpg?1)`);
        const [status, keymode] = this.document.querySelectorAll(".beatmap-bubbles__item");
        status.innerHTML = `${cardData.map.status}`;

        if (cardData.recent.mode === 3) {
            keymode.innerHTML = `${cardData.map.difficulty.cs}K`;
        } else {
            keymode.setAttribute("style", "display: none");
        }

        const [title, artist] = this.document.querySelectorAll(".beatmap-metadata__item");
        title.innerHTML = cardData.map.title;
        artist.innerHTML = cardData.map.artist;

        this.document.querySelector(".beatmap-footer__artist--highlighted").innerHTML = cardData.map.creator;
        this.document.querySelector(".beatmap-footer__id").innerHTML = String(cardData.recent.beatmapId);

        const mode = this.document.querySelector(".beatmap-footer__mode");
        mode.setAttribute("style", `color: ${this.getDiffColor(cardData.map.difficulty.stars)}`);
        mode.classList.remove("diff--std");

        switch (cardData.recent.mode) {
            case 0: {
                mode.classList.add("diff--std");
                break;
            }
            case 1: {
                mode.classList.add("diff--taiko");
                break;
            }
            case 2: {
                mode.classList.add("diff--ctb");
                break;
            }
            case 3: {
                mode.classList.add("diff--mania");
                break;
            }
        }
    }

    private modifyStats(cardData: IRecentCardArgs) {
        const [OD, AR, HP, CS] = this.document.querySelectorAll(".stat");
        OD.innerHTML = `OD: ${cardData.map.difficulty.od.toFixed(1)}`;
        AR.innerHTML = `AR: ${cardData.map.difficulty.ar.toFixed(1)}`;
        HP.innerHTML = `HP: ${cardData.map.difficulty.hp.toFixed(1)}`;
        CS.innerHTML = `CS: ${cardData.map.difficulty.cs.toFixed(1)}`;

        if (cardData.recent.mode === 1 || cardData.recent.mode === 3) {
            this.document.querySelectorAll(".beatmap-stats__item").forEach(e => e.setAttribute("style", "justify-content: center"));
            AR.setAttribute("style", "display: none");
            CS.setAttribute("style", "display: none");
        }

        this.document.querySelector(".beatmap-stats__item--sr").innerHTML = `
            ${cardData.map.difficulty.stars.toFixed(2)}
            <span class="star">★</span>
        `;

        /* this.document.querySelector(".beatmap-stats__item--length").innerHTML = String(cardData.map.length);
        this.document.querySelector(".beatmap-stats__item--bpm").innerHTML = `${cardData.map.bpm.avg}bpm`;
        this.document.querySelector(".beatmap-stats__item--maxcombo").innerHTML = `${cardData.map.maxCombo}x`; */
    }

    private modifyRecent(cardData: IRecentCardArgs) {
        const nickname = this.document.querySelector(".score-data__nickname");
        nickname.innerHTML = cardData.username;

        const avatar = this.document.querySelector(".score__avatar");
        avatar.setAttribute("src", `https://a.ppy.sh/${cardData.playerId}?1.jpeg`);

        const grade = this.document.querySelector(".score-data-stats__grade");
        grade.innerHTML = `${this.convertGrade(cardData.recent.rank)}`;
        grade.classList.remove("grade-S");
        grade.classList.add(this.getGradeClassName(cardData.recent.rank));

        const [acc, combo, score] = this.document.querySelectorAll(".score-data-stats__values span");
        acc.innerHTML = `${(cardData.recent.accuracy * 100).toFixed(2)}%`;
        combo.innerHTML = `${cardData.recent.maxCombo}x`;
        score.innerHTML = `${cardData.recent.score}`;

        const [h320, h300, h200, h100, h50, h0] = this.document.querySelectorAll(".hitcounts-col__item");
        h320.innerHTML = String(cardData.recent.counts.geki);
        h300.innerHTML = String(cardData.recent.counts[300]);
        h200.innerHTML = String(cardData.recent.counts.katu);
        h100.innerHTML = String(cardData.recent.counts[100]);
        h50.innerHTML = String(cardData.recent.counts[50]);
        h0.innerHTML = String(cardData.recent.counts.miss);

        if (cardData.map.mode != 3)
            this.document.querySelectorAll(".hitcounts-col")[1].setAttribute("style", "display: none"); 
    }

    private modifyFooter(cardData: IRecentCardArgs) {
        const [PP, FC, SS] = this.document.querySelectorAll(".beatmap-pp__item--value");
        PP.innerHTML = `${cardData.pp.pp.toFixed(0)}`;
        FC.innerHTML = `${cardData.pp.fcpp.toFixed(0)}`;
        SS.innerHTML = `${cardData.pp.sspp.toFixed(0)}`;
    }

    protected modify(cardData: IRecentCardArgs) {
        this.modifyHeader(cardData);
        this.modifyStats(cardData);
        this.modifyRecent(cardData);
        this.modifyFooter(cardData);
    }
}