import ServerModule from "../../Commands/Server/ServerModule";
import KurikkuNick from "./Commands/Nick";
import KurikkuUser from "./Commands/User";
import KurikkuTop from "./Commands/Top";
import KurikkuMode from "./Commands/Mode";
import KurikkuRecent from "./Commands/Recent";
import KurikkuCompare from "./Commands/Compare";

export default class Kurikku extends ServerModule {
    name = "Kurikku";
    prefix = ["k", "л"];

    baseLink = "";

    description = "";

    api = this.apilist.kurikku;

    db = this.database.servers.kurikku;

    commands = [
        new KurikkuNick(this),
        new KurikkuMode(this),
        new KurikkuUser(this),
        new KurikkuTop(this),
        new KurikkuRecent(this),
        new KurikkuCompare(this)
    ];
}