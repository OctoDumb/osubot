import ServerModule from "../../Commands/Server/ServerModule";
import BanchoNick from "./Commands/Nick";
import BanchoUser from "./Commands/User";
import BanchoTop from "./Commands/Top";
import BanchoMode from "./Commands/Mode";
import BanchoRecent from "./Commands/Recent";
import BanchoCompare from "./Commands/Compare";

export default class Bancho extends ServerModule {
    name = "Bancho";
    prefix = ["s", "ы"];

    baseLink = "https://osu.ppy.sh/";

    description = "Официальный сервер Osu!";

    api = this.apilist.bancho;

    db = this.database.servers.bancho;

    commands = [
        new BanchoNick(this),
        new BanchoMode(this),
        new BanchoUser(this),
        new BanchoTop(this),
        new BanchoRecent(this),
        new BanchoCompare(this)
    ];
}