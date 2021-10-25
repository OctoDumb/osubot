import path from "path";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { scaleLinear, interpolateRgb } from "d3";
import Config from "../Config";

export default abstract class CardGenerator<T> {
    protected template: string;

    private readonly diffColorSpectrum = scaleLinear<string>()
        .domain([1.5, 2, 2.5, 3.25, 4.5, 6, 7, 8])
        .clamp(true)
        .range(["#4FC0FF", "#4FFFD5", "#7CFF4F", "#F6F05C", "#FF8068", "#FF3C71", "#6563DE", "#18158E"])
        .interpolate(interpolateRgb.gamma(2.2));

    public generate(data: T): string {
        let DOM = new JSDOM(this.template)

        DOM.window.document.querySelector("#osuicons").setAttribute("href", this.icons);

        this.transform(DOM, data);

        return DOM.serialize();
    }

    private readonly icons = `http://localhost:${Config.data.api.port}/public/osu-icons.css`;

    protected get dir(): string { return path.join(".", "cards/dist", this._dir) }

    protected abstract transform(dom: JSDOM, data: T): void;

    constructor(
        protected _dir: string
    ) {
        let html = readFileSync(path.join(this.dir, 'index.html'), 'utf-8');
        let css = readFileSync(path.join(this.dir, 'index.css'), 'utf-8');

        let DOM = new JSDOM(html);
        const style = DOM.window.document.createElement("style");
        style.innerHTML = css;
        DOM.window.document.head.appendChild(style);

        this.template = DOM.serialize();
    }

    protected separateNumber = (num: number) => String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    protected getCountryCode = (code: string) => code.split('').map(c => (c.charCodeAt(0) + 127397).toString(16)).join('-');

    protected getDiffColor = (diff: number) => diff >= 8 ? "#000000" : this.diffColorSpectrum(diff);

    protected getGradeClassName = (grade: string) => `grade-${grade}`;

    protected convertGrade(grade: string) {
        switch(grade) {
            case "SSH":
            case "XH":
            case "X":
                return "SS";
            case "SH":
                return "S";
            default:
                return grade;
        }
    }
}