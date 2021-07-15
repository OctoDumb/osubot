import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import MissingArgumentsError from "../../../Errors/MissingArguments";
import { Permission } from "../../../Permissions";

export default class AdminNews extends Command {
    name = "News";
    command = ["news"];

    delay = 0;

    description = "Рассылка";

    permission = Permission.ADMIN;

    async run({ message, news }: ICommandArguments) {
        if(!message.forwarded)
            throw new MissingArgumentsError("Перешлите сообщение для рассылки!");

        let m = message.forwarded;

        news.send('group', {
            message: m.text, 
            attachment: m.attachments.map(m => m.toString()).join(",") 
        });
    }
}