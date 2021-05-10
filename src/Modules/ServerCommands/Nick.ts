import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";

export default class NickCommand extends ServerCommand<OsuAPI> {
    name = "Nick";
    command = [ "n", "nick", "т", "тшсл" ];

    description = "Привязать аккаунт";

    async run({ message, database }: IServerCommandArguments<null>) {
        let username = message.arguments.join(" ");
        
        let user = await this.api.getUser({ username });

        let data = {
            userId: message.sender,
            playerId: user.id,
            server: this.module.name,
            nickname: user.username
        };

        let exists = (await database.serverConnection.count({ where: { playerId: user.id, server: this.module.name, nickname: user.username } })) > 0;
        if(exists)
            await database.serverConnection.updateMany({
                data, where: {
                    userId: message.sender,
                    server: this.module.name
                }
            });
        else
            await database.serverConnection.create({ data })
        
        message.reply(`
            [Server: ${this.module.name}]
            Установлен ник: ${user.username}
        `);
    }
}