import Bot from "../../Bot";
import Module from "../../Commands/Module";
import Message from "../../Message";
import AdminEval from "./Eval";
import AdminNews from "./News";

export default class Admin extends Module {
    name = "Admin";
    prefix = ["admin"];

    description = "Команды администратора";

    commands = [
        new AdminNews(),
        new AdminEval()
    ];

    isPermitted(message: Message, bot: Bot) {
        const { ownerId } = bot.config.vk;
        const { sender } = message;
        return Array.isArray(ownerId) ? ownerId.includes(sender) : sender === ownerId;
    }
}