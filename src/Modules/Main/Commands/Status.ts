import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainStatus extends Command {
    name = "Status";
    command = [ "status", "ыефегы" ];

    delay = 0;

    description = "";

    async run({ message, privileges }: ICommandArguments) {
        let { sender, arguments: args } = message;

        if(args.length == 0) {
            let msg = `
                Ваши привилегии:
                ${privileges.getPrivileges(sender).map(
                    p => privileges.types.getType(p)).map(
                    p => `${p.name} - ${p.description}`).join("\n")}
            `;

            return message.reply(msg);
        }

        switch(args[0].toLowerCase()) {
            case "set":
                if(args.length < 2)
                    return message.reply("Недостаточно аргументов!");
                privileges.setStatus(sender, args[1]);
                break;

            case "list":
                let privs = privileges.getPrivileges(sender);
                let statuses = privileges.types.getAvailableStatuses(privs);

                message.reply(`Доступные статусы:\n${statuses.join(" , ")}`);
                break;

            default: 
                throw "Неизвестная команда!";
        }
    }
}