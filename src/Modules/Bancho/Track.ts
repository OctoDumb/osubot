import Bot from "../../Bot";
import { IArgumentsWithMode, IServerCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import Message from "../../Message";
import { TrackTemplate } from "../../Templates";
import { defaultArguments, getUserInfo } from "../../Util";

export default class BanchoTrack extends ServerCommand {
    name = "Track";
    command = [ "update", "гзвфеу" ];

    description = "";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IArgumentsWithMode> {
        return{
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [
                Parsers.mode
            ])
        }
    }

    async run({
        message, args,
        clean, track,
        database
    }: IServerCommandArguments<IArgumentsWithMode>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);
        
        let update = await track.getChanges(username, mode);

        let msg = TrackTemplate(update);

        message.reply(msg);
    }
}