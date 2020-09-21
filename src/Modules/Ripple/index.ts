import ServerModule from "../../Commands/Server/ServerModule";
import RippleNick from "./Commands/Nick";
import RippleUser from "./Commands/User";
import RippleTop from "./Commands/Top";
import RippleMode from "./Commands/Mode";
import RippleRecent from "./Commands/Recent";
import RippleCompare from "./Commands/Compare";

export default class Ripple extends ServerModule {
    name = "Ripple";
    prefix = ["r", "к"];

    baseLink = "";

    description = "";

    api = this.apilist.ripple;

    db = this.database.servers.ripple;

    commands = [
        new RippleNick(this),
        new RippleMode(this),
        new RippleUser(this),
        new RippleTop(this),
        new RippleRecent(this),
        new RippleCompare(this)
    ];
}