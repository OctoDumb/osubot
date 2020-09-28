import Module from "../Module";
import { Server } from "../../Database";
import ServerCommand from "./ServerCommand";
import IServerAPI from "../../API/ServerAPI";

export default abstract class ServerModule extends Module {
    api: IServerAPI;
    db: Server;

    abstract baseLink: string;

    command: ServerCommand[] = [];
}