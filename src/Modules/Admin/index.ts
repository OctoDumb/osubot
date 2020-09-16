import Bot from "../../Bot";
import Module from "../../Commands/Module";
import Message from "../../Message";
import AdminNews from "./News";

export default class Admin extends Module {
    name = "Admin";
    prefix = ["admin"];

    description = "Команды администратора";

    commands = [
        new AdminNews()
    ];

    isPermitted(message: Message, bot: Bot) {
        return message.sender === bot.config.vk.ownerId;
    }
}