import Command from "../Command";
import { IServerCommandArguments, parseArguments } from "../Arguments";
import { Server } from "../../Database";
import IServerAPI from "../../API/ServerAPI";
import ServerModule from "./ServerModule";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments } from "../../Util";

export default abstract class ServerCommand extends Command {
    abstract run(args: IServerCommandArguments<any>): void;

    protected database: Server;
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
        this.database = module.db;
        this.api = module.api;
    }
}