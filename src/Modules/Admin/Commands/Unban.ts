import Banlist from "../../../Banlist";
import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Ban } from "../../../Database/entity/Ban";
import Message from "../../../Message";
import { Permission } from "../../../Permissions";

const mention = /\[id(?<id>\d+)|.+\]/i;

export default class UnbanCommand extends Command {
    name = "Unban";
    command = [ "unban", "разбан" ];

    delay = 0;
    description = "";

    permission = Permission.BAN;

    async run({ message, database, vk }: ICommandArguments) {
        let id = message.forwarded?.senderId;
        if(message.arguments.length < 1) return message.reply("Недостаточно аргументов!");
        if(mention.test(message.arguments[0])) {
            id = Number(message.arguments.shift().match(mention).groups.id);
        }
        if(!id)
            return message.reply("Не указан пользователь!");
        
        let d = await Ban.delete({ user: { id } });

        message.reply(`[id${id}|Пользователь] ${d.affected > 0 ? "был разбанен" : "не был в бане"}`);

        if(d.affected > 0) {
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