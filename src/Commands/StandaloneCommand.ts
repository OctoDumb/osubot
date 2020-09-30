import Bot from "../Bot";
import Message from "../Message";
import { defaultArguments } from "../Util";
import { IStandaloneCommandArguments, parseArguments } from "./Arguments";
import Command from "./Command";

export default abstract class StandaloneCommand extends Command {
    parseArguments(message: Message, bot: Bot): IStandaloneCommandArguments<any> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [])
        };
    }

    abstract async run(args: IStandaloneCommandArguments<any>): Promise<void>;
}