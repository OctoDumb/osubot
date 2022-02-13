import CardGenerator from "./CardGenerator";
import ScoreCardGenerator from "./ScoreCardGenerator";
import TopCardGenerator from "./TopCardGenerator";
import UserCardGenerator from "./UserCardGenerator";

export default class CardsManager {
    private static generators: CardGenerator<any>[] = [
        new UserCardGenerator(),
        new ScoreCardGenerator(),
        new TopCardGenerator()
    ];

    public static getGenerator<T extends CardGenerator<any>>(Gen: new () => T): T {
        return <T>this.generators.find(g => g instanceof Gen);
    }
}