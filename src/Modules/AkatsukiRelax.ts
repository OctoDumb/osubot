import ServerModule from "../Commands/Server/ServerModule";
import UserCommand from "./ServerCommands/User";
import TopCommand from "./ServerCommands/Top";
import RecentCommand from "./ServerCommands/Recent";

export default class AkatsukiRelax extends ServerModule {
    name = "Akatsuki relax";
    prefix = ["ax", "фч"];

    baseLink = "https://akatsuki.pw/";

    description = "";

    api = this.apilist.akatsukiRelax;

    commands = [
        new UserCommand(this),
        new TopCommand(this),
        new RecentCommand(this)
    ];
}