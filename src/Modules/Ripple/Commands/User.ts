import ServerCommand from "../../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../../Commands/Arguments";
import { UserTemplate } from "../../../Templates";

export default class RippleUser extends ServerCommand {
    name = "User";
    command = [ "u", "user", "г", "гыук" ];

    description = `Посмотреть профиль на ${this.module.name}`;

    async run({ message }: IServerCommandArguments<null>) {
        let { nickname: username } = await this.database.getUser(message.sender);
        if(message.arguments[0])
            username = message.arguments.join(" ");

        let user = await this.api.getUser({ username });

        message.reply(UserTemplate(this.module, user));
    }
}