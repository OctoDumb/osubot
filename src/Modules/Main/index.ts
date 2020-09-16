import Module from "../../Commands/Module";
import MainNews from "./News";

export default class Main extends Module {
    name = "";
    prefix = ["osu"];

    description = "";

    commands = [
        new MainNews()
    ];
}