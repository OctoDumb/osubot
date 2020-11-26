import Banlist from "../../../Banlist";
import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import Message from "../../../Message";

const mention = /\[id(?<id>\d+)|.+\]/i;

export default class UnbanCommand extends Command {
    name = "Unban";
    command = [ "unban", "разбан" ];

    delay = 0;
    description = "";

    async run({ message, vk }: ICommandArguments) {
        let id = message.forwarded?.senderId;
        if(message.arguments.length < 1) return message.reply("Недостаточно аргументов!");
        if(mention.test(message.arguments[0])) {
            id = Number(message.arguments.shift().match(mention).groups.id);
        }
        if(!id)
            return message.reply("Не указан пользователь!");

        let unbanned = Banlist.removeBan(id);

        message.reply(`[id${id}|Пользователь] ${unbanned ? "был разбанен" : "не был в бане"}`);

        if(unbanned) {
            try {
                await vk.api.messages.send({
                    peer_id: id,
                    message: Message.fixString(`
                        Ваш бан был снят досрочно!
                    `)
                });
            } catch(e) {}
        }
    }
}