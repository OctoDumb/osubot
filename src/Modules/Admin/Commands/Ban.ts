import Banlist from "../../../Banlist";
import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import Message from "../../../Message";
import { stringDateToMs } from "../../../Util";
import dateformat from "dateformat";

const mention = /\[id(?<id>\d+)|.+\]/i;

export default class BanCommand extends Command {
    name = "Ban";
    command = [ "ban", "бан" ];

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

        let duration = stringDateToMs(message.arguments.shift() ?? "");

        let reason = message.arguments.join(" ");

        let until = Banlist.addBan(id, duration, reason);

        message.reply(`[id${id}|Пользователь] забанен!`);

        try {
            await vk.api.messages.send({
                peer_id: id,
                message: Message.fixString(`
                    Вы были забанены!
                    Время окончания бана: ${dateformat(until, "dd mmm yyyy HH:MM:ss 'MSK'")}
                    Причина бана: ${reason ? reason : "не указана"}
                `),
                ...Message.DefaultParams
            });
            Banlist.setNotified(id);
        } catch(e) {}
    }
}