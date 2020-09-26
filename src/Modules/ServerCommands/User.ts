import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments } from "../../Commands/Arguments";
import { UserTemplate } from "../../Templates";

export default class UserCommand extends ServerCommand {
    name = "User";
    command = [ "u", "user", "г", "гыук" ];

    description = `Посмотреть профиль на ${this.module.name}`;

    async run({ message, privileges }: IServerCommandArguments<null>) {
        let { nickname: username } = await this.database.getUser(message.sender);
        if(message.arguments[0])
            username = message.arguments.join(" ");

        let user = await this.api.getUser({ username });

        let users = await this.database.findByUserId(user.id);
        let status = privileges.getUserStatus(users);

        message.reply(UserTemplate(this.module, user, status));
    }
}