import Command from "../Command";
import { IServerCommandArguments, parseArguments } from "../Arguments";
import ServerModule from "./ServerModule";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments } from "../../Util";
import ServerAPIManager from "../../API/ServerAPIManager";

export default abstract class ServerCommand<T = unknown> extends Command {
    abstract run(args: IServerCommandArguments<any>): Promise<void>;

    get api(): T {
        return ServerAPIManager.get(this.module.name) as unknown as T;
    }

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<any> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [])
        }
    }

    constructor(
        protected module: ServerModule
    ) {
        super();
    }
}