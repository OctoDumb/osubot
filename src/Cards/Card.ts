import fs from "fs";
import { JSDOM } from "jsdom";

export default abstract class Card<T> {
    protected htmlText = fs.readFileSync(`${this.dirPath}/index.html`, "utf-8");
    protected cssText = fs.readFileSync(`${this.dirPath}/index.css`, "utf-8");
    protected DOM = new JSDOM(this.htmlText);

    protected document = this.DOM.window.document;

    protected abstract modify(cardData: T): void;

    constructor(
        protected dirPath: string,
    ) {}

    public create(cardData: T): string {
        this.modify(cardData);

        const style = this.document.createElement("style");
        style.innerHTML = this.cssText;
        this.document.getElementsByTagName("head")[0].appendChild(style);
        
        return this.DOM.serialize();
    }

    protected getGradeClassName(grade: string) {
        switch (grade) {
            case "XH": return "grade-XH";
            case "X": return "grade-X";
            case "SH": return "grade-SH";
            case "S": return "grade-S";
            case "A": return "grade-A";
            case "B": return "grade-B";
            case "C": return "grade-C";
            case "F": return "grade-F";
        }
    }

    protected convertGrade(grade: string) {
        switch (grade) {
            case "XH": 
            case "X": 
                return "X";
            case "SH":
            case "S": 
                return "S";
            case "A": return "A";
            case "B": return "B";
            case "C": return "C";
            case "F": return "F";
        }
    }

    protected getDiffColor(starRate: number) {
        if(starRate < 2) return "#88B300";
        else if(starRate < 2.7) return "#66CCFF";
        else if(starRate < 4) return "#FFCC22";
        else if(starRate < 5.3) return "#FF66AA";
        else if(starRate < 6.5) return "#8866EE";
        else return "diff-expertplus";
    }
}