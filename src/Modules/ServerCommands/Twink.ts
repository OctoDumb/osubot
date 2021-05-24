import { IServerCommandArguments } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { TwinkAccept } from "../../Database/entity/TwinkAccept";

export default class TwinkCommand extends ServerCommand {
    name = "Twink";
    command = [ "twink", "ецштл" ];

    description = "";

    async run({ message }: IServerCommandArguments<null>) {
        if(!message.forwarded) return message.reply('Перешлите сообщение пользователя!');

        const userId = message.forwarded.senderId;

        let tw = await TwinkAccept.findOne({ 
            where: { 
                senderId: message.sender,
                receiverId: userId,
                server: this.module.name 
            } 
        });

        if(tw)
            return message.reply(`
                [Server: ${this.module.name}]
                [id${userId}|Пользователю] уже разрешено использовать ваш ник!
            `);

        await TwinkAccept.create({
            senderId: message.sender,
            receiverId: userId,
            server: this.module.name
        }).save();

        return message.reply(`
            [Server: ${this.module.name}]
            Теперь [id${userId}|пользователю] разрешено использовать ваш ник!
        `);
    }
}