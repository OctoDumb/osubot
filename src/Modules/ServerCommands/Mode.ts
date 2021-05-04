import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { modeNumberToString } from "../../Util";
import { ServerConnection } from "../../Database/entity/ServerConnection";

export default class ModeCommand extends ServerCommand {
    name = "Mode";
    command = [ "m", "mode", "ь", "ьщву" ];

    description = "Установить/проверить геймод по умолчанию";

    async run({ message, database, vk }: IServerCommandArguments<null>) {
        const forwarded = message.forwarded

        if (forwarded) {
            const userId = forwarded.senderId;
            const { mode } = await ServerConnection.findOne({ where: { user: { id: userId } } });
            const [user] = await vk.api.users.get({ 
                user_ids: [userId.toString()]
            });

            message.reply(`
                [Server: ${this.module.name}]
                У [id${user.id}|${user.first_name} ${user.last_name}] стоит режим ${modeNumberToString(Number(mode))}
            `);
            return;
        }

        let mode = message.arguments[0];

        if(mode == null) throw "Некорректный режим!";

        await ServerConnection.update({
            user: { id: message.sender },
            server: this.module.name
        }, {
            mode: Number(mode)
        });

        message.reply(`
            [Server: ${this.module.name}]
            Режим ${modeNumberToString(Number(mode))} успешно установлен!
        `);
    }
}