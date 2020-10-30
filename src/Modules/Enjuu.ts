import ServerModule from "../Commands/Server/ServerModule";
import NickCommand from "./ServerCommands/Nick";
import UserCommand from "./ServerCommands/User";
import TopCommand from "./ServerCommands/Top";
import ModeCommand from "./ServerCommands/Mode";
import RecentCommand from "./ServerCommands/Recent";
import CompareCommand from "./ServerCommands/Compare";
import FindCommand from "./ServerCommands/Find";
import ChatCommand from "./ServerCommands/Chat";

export default class Enjuu extends ServerModule {
    name = "Enjuu";
    prefix = ["e", "у"];

    baseLink = "https://enjuu.click/";

    description = "";

    api = this.apilist.enjuu;

    db = this.database.servers.enjuu;

    commands = [
        new NickCommand(this),
        new ModeCommand(this),
        new UserCommand(this),
        new TopCommand(this),
        new RecentCommand(this),
        new CompareCommand(this),
        new FindCommand(this),
        new ChatCommand(this)
    ];
}