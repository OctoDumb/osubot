import Banlist from "../../../Banlist";
import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import dateformat from "dateformat";

export default class MainBan extends Command {
    name = "Ban";
    command = [ "ban", "бан" ];

    delay = 0;
    description = "";

    async run({ message }: ICommandArguments) {
        let ban = Banlist.getBanStatus(message.sender);

        if(!ban)
            return message.reply("У вас нет бана!");

        message.reply(`
            Дата окончания бана: ${dateformat(new Date(ban.until), "dd mmm yyyy HH:MM:ss 'MSK'")}
            Причина бана: ${ban.reason ? ban.reason : "не указана"}
        `);
    }
}