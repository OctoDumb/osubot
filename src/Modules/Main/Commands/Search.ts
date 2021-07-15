import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import MissingArgumentsError from "../../../Errors/MissingArguments";
import { SearchTemplate } from "../../../Templates";

export default class MainSearch extends Command {
    name = "Search";
    command = [ "search", "ыуфкср" ];

    description = "";

    async run({ message, v2 }: ICommandArguments) {
        let query = message.arguments.join(" ");

        if(!query)
            throw new MissingArgumentsError("Укажите запрос!");

        let maps = await v2.getBeatmapsets({ query });

        let msg = SearchTemplate(maps);

        message.reply(msg);
    }
}