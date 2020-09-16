import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";

export default class BanchoNick extends ServerCommand {
    name = "Nick";
    command = [ "n", "nick", "т", "тшсл" ];

    description = "Привязать аккаунт";

    async run({ message }: IServerCommandArguments<null>) {
        let username = message.arguments.join(" ");
        
        let user = await this.api.getUser({ username });

        this.database.setNickname(message.sender, user.id, user.username);
        
        message.reply(`[Server: Bancho]
            Установлен ник: ${user.username}`);
    }
}