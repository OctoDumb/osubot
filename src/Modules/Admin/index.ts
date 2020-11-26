import Bot from "../../Bot";
import Module from "../../Commands/Module";
import Message from "../../Message";
import BanCommand from "./Commands/Ban";
import AdminEval from "./Commands/Eval";
import AdminNews from "./Commands/News";
import PrivilegesCommand from "./Commands/Priveleges";
import AdminSQL from "./Commands/SQL";
import UnbanCommand from "./Commands/Unban";
import AdminVKScripts from "./Commands/VKScripts";

export default class Admin extends Module {
    name = "Admin";
    prefix = ["admin"];

    description = "Команды администратора";

    commands = [
        new AdminNews(),
        new AdminEval(),
        new AdminSQL(),
        new AdminVKScripts(),
        new PrivilegesCommand(),
        new BanCommand(),
        new UnbanCommand()
    ];

    isPermitted(message: Message, bot: Bot) {
        const { ownerId } = bot.config.vk;
        const { sender } = message;
        return sender === ownerId || bot.privilegesManager.hasPrivilege(sender, "Owner");
    }
}