import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { modeNumberToString } from "../../Util";

export default class ModeCommand extends ServerCommand {
    name = "Mode";
    command = [ "m", "mode", "ь", "ьщву" ];

    description = "Установить геймод по умолчанию";

    async run({ message, database }: IServerCommandArguments<null>) {
        let mode = message.arguments[0];

        if(mode == null) throw "Некорректный режим!";

        await database.serverConnection.updateMany({
            data: {
                mode: Number(mode)
            },
            where: {
                userId: message.sender,
                server: this.module.name
            }
        })

        message.reply(`
            [Server: ${this.module.name}]
            Режим ${modeNumberToString(Number(mode))} успешно установлен!
        `);
    }
}