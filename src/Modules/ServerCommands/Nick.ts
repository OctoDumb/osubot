import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { ServerConnection } from "../../Database/entity/ServerConnection";

export default class NickCommand extends ServerCommand {
    name = "Nick";
    command = [ "n", "nick", "т", "тшсл" ];

    description = "Привязать аккаунт";

    async run({ message }: IServerCommandArguments<null>) {
        try {
            let username = message.arguments.join(" ");
            
            let user = await this.api.getUser({ username });

            let data = {
                userId: message.sender,
                playerId: user.id,
                server: this.module.name,
                nickname: user.username
            };

            let exists = (await ServerConnection.count({ where: { user: { id: message.sender }, server: this.module.name } })) > 0;
            if(exists)
                await ServerConnection.update({
                    user: { id: message.sender },
                    server: this.module.name
                }, {
                    playerId: user.id,
                    nickname: user.username
                })
            else
                await ServerConnection.create({
                    user: { id: message.sender },
                    server: this.module.name,
                    playerId: user.id,
                    nickname: user.username
                }).save();
            
            message.reply(`
                [Server: ${this.module.name}]
                Установлен ник: ${user.username}
            `);
        } catch(e) {
            console.log(e);
            throw e;
        }
    }
}