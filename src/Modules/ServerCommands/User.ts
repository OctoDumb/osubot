import Message from "../../Message";
import Bot from "../../Bot";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments, IRecentCommandArguments, Parsers, parseArguments } from "../../Commands/Arguments";
import { UserTemplate } from "../../Templates";
import { defaultArguments, getStatus, getUserInfo, updateInfo } from "../../Util";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";

export default class UserCommand extends ServerCommand<OsuAPI> {
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

    async run({ message, database, privileges, clean, args }: IServerCommandArguments<IArgumentsWithMode>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        let user = await this.api.getUser({ username, mode });

        await updateInfo(database, this.module.name, user, mode);

        let status = await getStatus(database, user.id);

        message.reply(UserTemplate(this.module, user, status));
    }
}