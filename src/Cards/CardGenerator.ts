import path from "path";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { scaleLinear, interpolateRgb } from "d3";

export default abstract class CardGenerator<T> {
    protected template: string;

    private readonly diffColorSpectrum = scaleLinear<string>()
        .domain([1.5, 2, 2.5, 3.25, 4.5, 6, 7, 8])
        .clamp(true)
        .range(["#4FC0FF", "#4FFFD5", "#7CFF4F", "#F6F05C", "#FF8068", "#FF3C71", "#6563DE", "#18158E"])
        .interpolate(interpolateRgb.gamma(2.2));

    public generate(data: T): string {
        let DOM = new JSDOM(this.template)

        this.transform(DOM, data);

        return DOM.serialize();
    }

    protected readonly abstract _name: string;

    protected get dir(): string { return path.join(__dirname + "cards/dist" + this._name); }

    protected abstract transform(dom: JSDOM, data: T): void;

    constructor() {
        let html = readFileSync(`${this.dir}/index.html`, 'utf-8');
        let css = readFileSync(`${this.dir}/index.css`, 'utf-8');

        let DOM = new JSDOM(html);
        const style = DOM.window.document.createElement("style");
        style.innerHTML = css;
        DOM.window.document.head.appendChild(style);

        this.template = DOM.serialize();
    }

    protected getDiffColor = (diff: number) => diff >= 8 ? "#000000" : this.diffColorSpectrum(diff);

    protected getGradeClassName = (grade: string) => `grade-${grade}`;

    protected convertGrade(grade: string) {
        switch(grade) {
            case "SSH":
            case "XH":
                return "X";
            case "SH":
                return "S";
            default:
                return grade;
        }
    }
}