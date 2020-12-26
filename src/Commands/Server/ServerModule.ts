import Module from "../Module";
import ServerCommand from "./ServerCommand";
import IServerAPI from "../../API/ServerAPI";

export default abstract class ServerModule extends Module {
    api: IServerAPI;

    abstract baseLink: string;

    command: ServerCommand[] = [];
}