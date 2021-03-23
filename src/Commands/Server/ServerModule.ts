import Module from "../Module";
import ServerCommand from "./ServerCommand";
import { API, APIWithScores } from "../../API/ServerAPI";

export default abstract class ServerModule extends Module {
    api: API;

    abstract baseLink: string;

    command: ServerCommand[] = [];
}