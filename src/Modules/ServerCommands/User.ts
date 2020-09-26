import Message from "../../Message";
import Bot from "../../Bot";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments, IRecentCommandArguments, Parsers, parseArguments } from "../../Commands/Arguments";
import { UserTemplate } from "../../Templates";
import { defaultArguments } from "../../Util";

export default class UserCommand extends ServerCommand {
    name = "User";
    command = [ "u", "user", "г", "гыук" ];

    description = `Посмотреть профиль на ${this.module.name}`;

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IArgumentsWithMode> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.pass
            ])
        };
    }

    async run({ message, privileges, args }: IServerCommandArguments<IArgumentsWithMode>) {
        let { nickname: username, mode } = await this.database.getUser(message.sender);
        
        username = message.arguments[0] ?? username;

        let user = await this.api.getUser({ 
            username,
            mode: args.mode ?? mode
        });

        let users = await this.database.findByUserId(user.id);
        let status = users.length !== 0 ? privileges.getUserStatus(users) : "";
        

        message.reply(UserTemplate(this.module, user, status));
    }
}