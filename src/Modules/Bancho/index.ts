import ServerModule from "../../Commands/Server/ServerModule";
import BanchoNick from "./Nick";
import BanchoUser from "./User";
import BanchoTop from "./Top";
import BanchoMode from "./Mode";
import BanchoRecent from "./Recent";

export default class Bancho extends ServerModule {
    name = "Bancho";
    prefix = ["s", "ы"];

    baseLink = "https://osu.ppy.sh/";

    description = "Уебанчо";

    api = this.apilist.bancho;

    db = this.database.servers.bancho;

    commands = [
        new BanchoNick(this),
        new BanchoMode(this),
        new BanchoUser(this),
        new BanchoTop(this),
        new BanchoRecent(this)
    ];
}