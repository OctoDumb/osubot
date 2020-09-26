import Module from "../../Commands/Module";
import MainNews from "./Commands/News";
import MainStatus from "./Commands/Status";

export default class Main extends Module {
    name = "";
    prefix = [ "osu", "щыг" ];

    description = "";

    commands = [
        new MainNews(),
        new MainStatus()
    ];
}