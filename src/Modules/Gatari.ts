import ServerModule from "../Commands/Server/ServerModule";
import NickCommand from "./ServerCommands/Nick";
import UserCommand from "./ServerCommands/User";
import TopCommand from "./ServerCommands/Top";
import ModeCommand from "./ServerCommands/Mode";
import RecentCommand from "./ServerCommands/Recent";
import CompareCommand from "./ServerCommands/Compare";

export default class Gatari extends ServerModule {
    name = "Gatari";
    prefix = ["g", "п"];

    baseLink = "";

    description = "";

    api = this.apilist.gatari;

    db = this.database.servers.gatari;

    commands = [
        new NickCommand(this),
        new ModeCommand(this),
        new UserCommand(this),
        new TopCommand(this),
        new RecentCommand(this),
        new CompareCommand(this)
    ];
}