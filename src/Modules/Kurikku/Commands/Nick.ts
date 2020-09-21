import ServerCommand from "../../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../../Commands/Arguments";

export default class KurikkuNick extends ServerCommand {
    name = "Nick";
    command = [ "n", "nick", "т", "тшсл" ];

    description = "Привязать аккаунт";

    async run({ message }: IServerCommandArguments<null>) {
        let username = message.arguments.join(" ");
        
        let user = await this.api.getUser({ username });

        this.database.setNickname(message.sender, user.id, user.username);
        
        message.reply(`
            [Server: ${this.module.name}]
            Установлен ник: ${user.username}
        `);
    }
}