import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments } from "../../Commands/Arguments";
import { FindTemplate } from "../../Templates";
import { getUserInfo } from "../../Util";

export default class FindCommand extends ServerCommand {
    name = "Find";

    command = [ "f", "find", "а", "аштв" ];

    description = `Найти вк человека, играющего на ${this.module.name}`;

    async run({ message, database, vk, clean }: IServerCommandArguments<null>) {
        let { username } = await getUserInfo(message, this.module.name, database, clean);
        let u = await this.api.getUser({ username });
        let dbusers = await database.serverConnection.findMany({
            where: {
                playerId: u.id
            }
        });

        if(!dbusers[0])
            return message.reply(`
                [Server: ${this.module.name}]
                Пользователей с таким ником не найдено!`
            );

        let users = await vk.api.users.get({
            user_ids: dbusers.map(u => u.id).join()
        });

        message.reply(FindTemplate(this.module, u.username, users));
    }
}