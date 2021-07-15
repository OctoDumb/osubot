import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { modeNumberToString } from "../../Util";
import { ServerConnection } from "../../Database/entity/ServerConnection";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import IncorrectArgumentsError from "../../Errors/IncorrectArguments";
import NotFoundError from "../../Errors/NotFound";

export default class ModeCommand extends ServerCommand<OsuAPI> {
    name = "Mode";
    command = [ "m", "mode", "ь", "ьщву" ];

    description = "Установить/проверить режим по умолчанию";

    async run({ message, database, vk }: IServerCommandArguments<null>) {
        const forwarded = message.forwarded

        if (forwarded) {
            const userId = forwarded.senderId;
            const conn = await ServerConnection.findOne({ where: { user: { id: userId }, server: this.module.name } });
            if(!conn)
                throw new NotFoundError("Пользователь не найден в базе данных");

            const [ user ] = await vk.api.users.get({ 
                user_ids: String(userId)
            });

            return message.reply(`
                [Server: ${this.module.name}]
                У [id${user.id}|${user.first_name} ${user.last_name}] выбран режим ${modeNumberToString(conn.mode)}
            `);
        }

        let mode = message.arguments[0];

        if(!mode) 
            throw new IncorrectArgumentsError("Некорректный режим!");

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