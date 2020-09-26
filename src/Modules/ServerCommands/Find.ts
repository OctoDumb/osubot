import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments } from "../../Commands/Arguments";
import { FindTemplate } from "../../Templates";

export default class FindCommand extends ServerCommand {
    name = "Find";

    command = [ "f", "find", "а", "аштв" ];

    description = `Найти вк человека, играющего на ${this.module.name}`;

    async run({ message }: IServerCommandArguments<IArgumentsWithMode>) {
        let username: string = message.arguments[0];
        let u = await this.api.getUser({ username });
        let users = await this.database.findByUserId(u.id);

        if(!users[0])
            return message.reply(`
                [Server: ${this.module.name}]
                Пользователей с таким ником не найдено!`
            );

        message.reply(FindTemplate(this.module, username, users));
    }
}