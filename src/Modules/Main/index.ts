import Module from "../../Commands/Module";
import MainNews from "./Commands/News";
import MainSearch from "./Commands/Search";
import MainStatus from "./Commands/Status";
import MainUptime from "./Commands/Uptime";

export default class Main extends Module {
    name = "Main";
    prefix = [ "osu", "щыг" ];

    description = "";

    commands = [
        new MainNews(),
        new MainStatus(),
        new MainSearch(),
        new MainUptime()
    ];
}