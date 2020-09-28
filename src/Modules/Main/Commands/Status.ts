import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainStatus extends Command {
    name = "Status";
    command = [ "status", "статус", "ыефегы", "cnfnec" ];

    description = "";

    async run({ message, privileges }: ICommandArguments) {
        let { sender, arguments: args } = message;

        if(args.length < 1)
            throw "Недостаточно аргументов!";

        switch(args[0].toLowerCase()) {
            case "set":
                if(args.length < 2)
                    return message.reply("Недостаточно аргументов!");
                privileges.setStatus(sender, args[1]);
                break;

            case "list":
            case "список":
                let privs = privileges.getPrivileges(sender);
                let statuses = privileges.getAvailableStatuses(privs);

                message.reply(`Доступные статусы:\n${statuses.join(", ")}`);
                break;

            default: 
                throw "Неизвестная команда!";
        }
    }
}