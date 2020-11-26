import Message from "../Message";
import ICommandArguments from "./Arguments";
import Bot from "../Bot";
import { defaultArguments, round } from "../Util";

export interface ICommandUsage {
    user: number;
    time: number;
}

export default abstract class Command {
    abstract name: string;
    abstract command: string[];

    abstract description: string;

    delay: number = 5;

    usages: ICommandUsage[] = [];

    uses: number[] = [ 0 ];

    ignoreBan: boolean = false;

    use(message: Message) {
        let i = this.usages.findIndex(u => u.user == message.sender);
        if(i >= 0) {
            let lastUsage = this.usages[i];
            let delay = (lastUsage.time + this.delay * 1000) - Date.now();
            if(delay > 0)
                throw `Вы можете использовать эту команду через ${round(delay / 1000)}с`;
            this.usages[i].time = Date.now();
        } else {
            this.usages.push({ user: message.sender, time: Date.now() });
        }
        this.uses[this.uses.length - 1]++;
    }

    parseArguments(message: Message, bot: Bot): ICommandArguments {
        return defaultArguments(message, bot);
    }

    abstract run(args: ICommandArguments): Promise<void>;
}