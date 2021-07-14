import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments } from "../../Commands/Arguments";
import { FindTemplate } from "../../Templates";
import { getUserInfo } from "../../Util";
import { OsuAPIWithScores } from "../../API/Osu/OsuServerAPI";
import { ServerConnection } from "../../Database/entity/ServerConnection";

export default class FindCommand extends ServerCommand<OsuAPIWithScores> {
    name = "Find";

    command = [ "f", "find", "а", "аштв" ];

    description = `Найти вк человека, играющего на ${this.module.name}`;

    async run({ message, database, vk, clean }: IServerCommandArguments<null>) {
        let { username } = await getUserInfo(message, this.module.name, database, clean);
        let u = await this.api.getUser({ username });
        let dbusers = await ServerConnection.find({
            where: { playerId: u.id }, relations: [ 'user' ]
        });

        if(!dbusers[0])
            return message.reply(`
                [Server: ${this.module.name}]
                Пользователей с ником ${u.username} не найдено!`
            );

        let users = await vk.api.users.get({
            user_ids: dbusers.map(u => u.user.id).join()
        });

        message.reply(FindTemplate(this.module, u.username, users));
    }
}