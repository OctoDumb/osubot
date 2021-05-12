import Bot from "../Bot";
import Message from "../Message";
import { defaultArguments } from "../Util";
import ICommandArguments, { IStandaloneCommandArguments, parseArguments } from "./Arguments";
import Command from "./Command";

export default abstract class StandaloneCommand extends Command {
    parseAёrguments(message: Message, bot: Bot): IStandaloneCommandArguments<any> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [])
        };
    }

    abstract run(args: ICommandArguments): Promise<void>;
}