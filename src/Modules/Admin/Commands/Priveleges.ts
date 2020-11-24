import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class PrivilegesCommand extends Command {
    name = "Privileges";
    command = [ "privileges", "privs", "зкшмы" ];

    delay = 0;

    description = "";

    async run({ message, privileges }: ICommandArguments) {
        let { forwarded, arguments: args } = message;

        if(args.length < 1)
            return message.reply("Недостаточно аргументов!");

        switch(args[0].toLowerCase()) {
            case "add":
            case "+":
                if(args.length < 2)
                    return message.reply("Недостаточно аргументов!");
                try {
                    privileges.addPrivilege(forwarded?.senderId ?? message.sender, args[1]);
                    message.reply(`Привилегия ${args[1]} добавлена`);
                } catch(e) {
                    message.reply(`Ошибка: ${e.message}`);
                }
                break;

            case "remove":
            case "-":
                if(args.length < 2)
                    return message.reply("Недостаточно аргументов!");
                try {
                    privileges.removePrivilege(forwarded?.senderId ?? message.sender, args[1]);
                    message.reply(`Привилегия ${args[1]} удалена`);
                } catch(e) {
                    message.reply(`Ошибка: ${e.message}`);
                }
                break;

            case "list":
                let privs = privileges.getPrivileges(forwarded?.senderId ?? message.sender);
                message.reply(`Привилегии пользователя: ${privs.join(", ")}`);
                break;

            default:
                return message.reply("Неизвестная команда!");
        }
    }
}