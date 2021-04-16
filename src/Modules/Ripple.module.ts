import ServerModule from "../Commands/Server/ServerModule";
import NickCommand from "./ServerCommands/Nick";
import UserCommand from "./ServerCommands/User";
import TopCommand from "./ServerCommands/Top";
import ModeCommand from "./ServerCommands/Mode";
import RecentCommand from "./ServerCommands/Recent";
import CompareCommand from "./ServerCommands/Compare";
import FindCommand from "./ServerCommands/Find";
import { ModuleDecorator } from ".";

@ModuleDecorator
export default class Ripple extends ServerModule {
    name = "Ripple";
    prefix = ["r", "к"];

    baseLink = "https://ripple.moe/";

    description = "";

    api = this.apilist.ripple;

    commands = [
        new NickCommand(this),
        new ModeCommand(this),
        new UserCommand(this),
        new TopCommand(this),
        new RecentCommand(this),
        new CompareCommand(this),
        new FindCommand(this)
    ];
}