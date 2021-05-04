import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Permission } from "../../../Permissions";

enum DBCommandType {
    get = "get",
    run = "run"
}

export default class AdminSQL extends Command {
    name = "SQL";
    command = [ "sql" ];

    delay = 0;

    description = "";

    permission = Permission.ADMIN;

    async run({ message, database }: ICommandArguments) {
        let type = message.arguments.shift();
        let stmt = message.arguments.join(" ");
        let res: any | any[];

        // TODO: Remake SQL command
    }
}