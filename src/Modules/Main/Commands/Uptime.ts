import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainUptime extends Command {
    name = "Uptime";
    command = ["uptime"];

    delay = 0;

    description = "Получить время работы бота";

    async run({ message, uptime }: ICommandArguments) {
        message.reply(`
            Время работы:
            ${Math.floor(uptime / 3600 / 24)}д ${Math.floor(uptime / 3600) % 24}ч ${Math.floor(uptime / 60) % 60}м ${uptime % 60}с
        `);
    }
}