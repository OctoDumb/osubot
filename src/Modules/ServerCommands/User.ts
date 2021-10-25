import Message from "../../Message";
import Bot from "../../Bot";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IArgumentsWithMode, Parsers, parseArguments, IServerCommandWithCardArguments } from "../../Commands/Arguments";
import { UserTemplate } from "../../Templates";
import { Stats } from "../../Database/entity/Stats";
import { defaultArguments, getStatus, getUserInfo } from "../../Util";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import MissingArgumentsError from '../../Errors/MissingArguments';
import ServerCommandWithCard from "../../Commands/Server/ServerCommandWithCard";
import UserCardGenerator, { IUserCardArguments } from "../../Cards/UserCardGenerator";

export default class UserCommand extends ServerCommandWithCard<OsuAPI> {
    name = "User";
    command = [ "u", "user", "г", "гыук" ];

    description = `Посмотреть профиль на ${this.module.name}`;

    parseArguments(message: Message, bot: Bot): IServerCommandWithCardArguments<IArgumentsWithMode> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.card
            ])
        };
    }

    async run({ message, database, privileges, clean, args, vk }: IServerCommandWithCardArguments<IArgumentsWithMode>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        if(!username)
            throw new MissingArgumentsError("Не указан ник!");

        let user = await this.api.getUser({ username, mode });

        await Stats.updateInfo(this.module.name, user, mode);

        if(args.card)
            return this.sendCard(UserCardGenerator, { vk, message, obj: { player: user } });

        let status = await getStatus(user.id);

        message.reply(UserTemplate(this.module, user, mode, status));
    }
}