import ServerCommand from "../../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../../Commands/Arguments";

export default class KurikkuMode extends ServerCommand {
    name = "Mode";
    command = [ "m", "mode", "ь", "ьщву" ];

    description = "Установить геймод по умолчанию";

    async run({ message }: IServerCommandArguments<null>) {
        let mode = message.arguments[0];

        if(mode == null) return message.reply("no.");

        this.database.setMode(message.sender, Number(mode));

        let m = ["Osu!", "Osu!Taiko", "Osu!Catch", "Osu!Mania"][Number(mode)];

        message.reply(`
            [Server: ${this.module.name}]
            Режим ${m} успешно установлен!
        `);
    }
}