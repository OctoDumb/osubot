import Module from "../Module";
import ServerCommand from "./ServerCommand";
import { API } from "../../API/ServerAPI";
import ServerAPIManager from "../../API/ServerAPIManager";

export default abstract class ServerModule extends Module {
    abstract baseLink: string;
    command: ServerCommand[] = [];
}