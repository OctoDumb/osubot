import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";

export default class BanchoMode extends ServerCommand {
    name = "Mode";
    command = [ "m", "mode", "ь", "ьщву" ];

    description = "";

    async run({ message }: IServerCommandArguments<null>) {
        let mode = message.arguments[0];

        if(mode == null) return message.reply("no.");

        this.database.setMode(message.sender, Number(mode));

        message.reply(`[Server: Bancho]
            Режим установлен!`);
    }
}