import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { ServerConnection } from "../../Database/entity/ServerConnection";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import { TwinkAccept } from "../../Database/entity/TwinkAccept";

export default class NickCommand extends ServerCommand<OsuAPI> {
    name = "Nick";
    command = [ "n", "nick", "т", "тшсл" ];

    description = "Привязать аккаунт";

    async run({ message }: IServerCommandArguments<null>) {
        try {
            let username = message.arguments.join(" ");
            
            let user = await this.api.getUser({ username });

            let orig = await ServerConnection.findOne({
                where: {
                    server: this.module.name,
                    playerId: user.id
                },
                relations: ['user']
            });
            if(orig) {
                let twink = await TwinkAccept.findOne({
                    where: {
                        senderId: orig.user.id,
                        receiverId: message.sender,
                        server: this.module.name
                    }
                });

                if(!twink && orig.user.id !== message.sender)
                    return message.reply(`
                        [Server: ${this.module.name}]
                        Этот аккаунт используется другим пользователем!
                        Если это ваш аккаунт, добавьте себя с помощью команду ${this.module.prefix[0]} twink
                        Если Вы считаете, что ваш аккаунт был занят другим человеком - обратитесь к администратору бота
                    `);
            }

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