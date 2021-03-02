import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Permission } from "../../../Permissions";


export default class AdminUsage extends Command {
    name = "Usage";
    command = [ "usage", "гыфпу" ];

    delay = 0;
    description = "";

    permission = Permission.ADMIN;

    async run({ message, database }: ICommandArguments) {
        const usersCount = await database.user.count();

        message.reply(`
            Бота используют ${usersCount} человек
        `);
    }
}