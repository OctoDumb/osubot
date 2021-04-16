import ServerModule from "../Commands/Server/ServerModule";
import NickCommand from "./ServerCommands/Nick";
import UserCommand from "./ServerCommands/User";
import TopCommand from "./ServerCommands/Top";
import ModeCommand from "./ServerCommands/Mode";
import RecentCommand from "./ServerCommands/Recent";
import CompareCommand from "./ServerCommands/Compare";
import FindCommand from "./ServerCommands/Find";
import ChatCommand from "./ServerCommands/Chat";
import { ModuleDecorator } from ".";

@ModuleDecorator
export default class Akatsuki extends ServerModule {
    name = "Akatsuki";
    prefix = ["a", "ф"];

    baseLink = "https://akatsuki.pw/";

    description = "";

    api = this.apilist.akatsuki;

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