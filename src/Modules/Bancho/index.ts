import ServerModule from "../../Commands/Server/ServerModule";
import NickCommand from "../ServerCommands/Nick";
import UserCommand from "../ServerCommands/User";
import TopCommand from "../ServerCommands/Top";
import ModeCommand from "../ServerCommands/Mode";
import RecentCommand from "../ServerCommands/Recent";
import CompareCommand from "../ServerCommands/Compare";
import FindCommand from "../ServerCommands/Find";
import ChatCommand from "../ServerCommands/Chat";
import LeaderboardCommand from "../ServerCommands/Leaderboard";
import TrackCommand from "./Track";

export default class Bancho extends ServerModule {
    name = "Bancho";
    prefix = ["s", "ы"];

    baseLink = "https://osu.ppy.sh/";

    description = "Официальный сервер Osu!";

    commands = [
        new NickCommand(this),
        new ModeCommand(this),
        new UserCommand(this),
        new TopCommand(this),
        new RecentCommand(this),
        new CompareCommand(this),
        new LeaderboardCommand(this),
        new FindCommand(this),
        new ChatCommand(this),
        new TrackCommand(this)
    ];
}
