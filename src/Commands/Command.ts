import Message from "../Message";
import ICommandArguments from "./Arguments";
import Bot from "../Bot";
import { defaultArguments } from "../Util";

export default abstract class Command {
    abstract name: string;
    abstract command: string[];

    abstract description: string;

    uses: number[] = [ 0 ];

    use() {
        this.uses[this.uses.length - 1]++;
    }

    parseArguments(message: Message, bot: Bot): ICommandArguments {
        return defaultArguments(message, bot);
    }

    abstract async run(args: ICommandArguments): Promise<void>;
}