import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class AdminVKScripts extends Command {
    name = "VKScripts";
    command = [ "script", "scripts" ];

    delay = 0;

    description = "";

    async run({ message, vk }: ICommandArguments) {
        let code = message.arguments.join(" ");
        let res = await vk.api.execute({ code });

        return message.reply(JSON.stringify(res, null, 2));
    }
}