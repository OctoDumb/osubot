import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { stringDateToMs } from "../../../Util";
import { Permission } from "../../../Permissions";
import { Ban } from "../../../Database/entity/Ban";
import MissingArgumentsError from "../../../Errors/MissingArguments";

const mention = /\[id(?<id>\d+)|.+\]/i;

export default class BanCommand extends Command {
    name = "Ban";
    command = [ "ban", "бан" ];

    delay = 0;
    description = "";

    permission = Permission.BAN;

    async run({ message, database, vk }: ICommandArguments) {
        let id = message.forwarded?.senderId;
        if(message.arguments.length < 1)
            throw new MissingArgumentsError("Недостаточно аргументов!");
        if(mention.test(message.arguments[0]))
            id = Number(message.arguments.shift().match(mention).groups.id);
        if(!id)
            throw new MissingArgumentsError("Не указан пользователь!");

        let duration = stringDateToMs(message.arguments.shift() ?? "");

        let reason = message.arguments.join(" ");

        Ban.add(vk, id, duration, reason);

        message.reply(`[id${id}|Пользователь] забанен!`);
    }
}