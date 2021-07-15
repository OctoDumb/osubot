import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import IncorrectArgumentsError from "../../../Errors/IncorrectArguments";
import MissingArgumentsError from "../../../Errors/MissingArguments";
import { Permission } from "../../../Permissions";

export default class PrivilegesCommand extends Command {
    name = "Privileges";
    command = [ "privileges", "privs", "зкшмы" ];

    delay = 0;

    description = "";

    permission = Permission.ADMIN;

    async run({ message, privileges }: ICommandArguments) {
        let { forwarded, arguments: args } = message;

        if(args.length < 1)
            throw new MissingArgumentsError("Недостаточно аргументов!");

        switch(args[0].toLowerCase()) {
            case "add":
            case "+":
                if(args.length < 2)
                    throw new MissingArgumentsError("Недостаточно аргументов!");
                privileges.addPrivilege(forwarded?.senderId ?? message.sender, args[1]);
                message.reply(`Привилегия ${args[1]} добавлена`);
                break;

            case "remove":
            case "-":
                if(args.length < 2)
                    throw new MissingArgumentsError("Недостаточно аргументов!");
                privileges.removePrivilege(forwarded?.senderId ?? message.sender, args[1]);
                message.reply(`Привилегия ${args[1]} удалена`);
                break;

            case "list":
                let privs = privileges.getPrivileges(forwarded?.senderId ?? message.sender);
                message.reply(`Привилегии пользователя: ${privs.join(", ")}`);
                break;

            default:
                throw new IncorrectArgumentsError("Неизвестная команда!");
        }
    }
}