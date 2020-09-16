import Module from "../Module";
import { Server } from "../../Database";
import ServerCommand from "./ServerCommand";
import IServerAPI from "../../API/ServerAPI";
import Message from "../../Message";
import Bot from "../../Bot";

export default abstract class ServerModule extends Module {
    api: IServerAPI;
    db: Server;

    abstract baseLink: string;

    command: ServerCommand[] = [];

    run(message: Message, bot: Bot) {
        if(!this.prefix.includes(message.prefix)) return;

        if(message.command == "help"
            || message.command == "рудз") return this.help(message);

        let command = this.commands.find(c => c.command.includes(message.command));
        if(!command) return;
        
        let args = command.parseArguments(message, bot);
        command.use();
        command.run(args);
    }
}