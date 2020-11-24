import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class AdminEval extends Command {
    name = "Eval";
    command = ["eval"];

    delay = 0;

    description = "evaluate";

    async run({ 
        message,
        database,
        mapAPI,
        news,
        vk
    }: ICommandArguments) {
        const { arguments: args } = message;
        try {
            let res = eval(args.join(" "));
            message.reply(`
                Успех!
                Тип данных: ${typeof res}
                ${typeof res == "object" ? JSON.stringify(res, null, 2) : res}
            `);
        } catch (e) {
            message.reply(`
                Ошибка!
                ${String(e)}
            `);
        }
    }
}