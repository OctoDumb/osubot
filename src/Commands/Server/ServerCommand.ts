import Command from "../Command";
import { IServerCommandArguments, parseArguments } from "../Arguments";
import IServerAPI from "../../API/ServerAPI";
import ServerModule from "./ServerModule";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments } from "../../Util";

export default abstract class ServerCommand extends Command {
    abstract run(args: IServerCommandArguments<any>): Promise<void>;

    protected api: IServerAPI;

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<any> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments([], [])
        }
    }

    constructor(
        protected module: ServerModule
    ) {
        super();
        this.api = module.api;
    }
}