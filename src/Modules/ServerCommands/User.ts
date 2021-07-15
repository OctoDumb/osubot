import Message from "../../Message";
import Bot from "../../Bot";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, IServerCommandArguments, Parsers, parseArguments } from "../../Commands/Arguments";
import { UserTemplate } from "../../Templates";
import { Stats } from "../../Database/entity/Stats";
import { defaultArguments, getStatus, getUserInfo } from "../../Util";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import MissingArgumentsError from '../../Errors/MissingArguments';

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

        if(!username)
            throw new MissingArgumentsError("Не указан ник!");

        let user = await this.api.getUser({ username, mode });

        await Stats.updateInfo(this.module.name, user, mode);

        let status = await getStatus(user.id);

        message.reply(UserTemplate(this.module, user, mode, status));
    }
}