import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainStatus extends Command {
    name = "Status";
    command = [ "status", "ыефегы" ];

    delay = 0;
    description = "";

    async run({ message, database }: ICommandArguments) {
        let args = message.arguments;
        
        if(!args[0])
            return message.reply("nope.");

        switch(args.shift().toLowerCase()) {
            case "list": {
                let [ page = 1 ] = args.map(Number);
                if(page < 1)
                    return message.reply("Некорректная страница");
                let owned = await database.statusOwned.findMany({
                    where: {
                        userId: message.sender
                    },
                    take: 10,
                    skip: 10 * (page - 1)
                });

                let ownedCount = await database.statusOwned.count({ where: { userId: message.sender } });
                if(!owned.length)
                    if(ownedCount == 0)
                        return message.reply("У вас нет статусов!");
                    else
                        return message.reply("Страница не найдена");

                let statuses = await database.$transaction(owned.map(o => database.status.findUnique({ where: { id: o.statusId } })));
                message.reply(`
                    Доступные статусы:
                    ${statuses.map(s => `[ID:${s.id}] ${s.name} (${s.emoji})`)}
                    Страница ${page} из ${Math.ceil(ownedCount / 10)}
                `);
                break;
            }
            case "set": {
                let [ st ] = args;
                let status = await database.status.findFirst({
                    where: {
                        OR: [
                            { id: Number(st) },
                            { emoji: st }
                        ]
                    }
                });
                let owned = await database.statusOwned.findFirst({
                    where: { userId: message.sender, statusId: status.id }
                });
                if(!owned)
                    return message.reply("У вас нет этого статуса!");
                await database.user.updateMany({
                    where: { id: message.sender },
                    data: { statusId: status.id }
                });
                message.reply(`
                    Установлен статус ${status.name} (${status.emoji})
                `);
                break;
            }
            case "info": {
                let [ st ] = args;
                let status = await database.status.findFirst({
                    where: {
                        OR: [
                            { id: Number(st) },
                            { emoji: st }
                        ]
                    }
                });
                message.reply(`
                    [ID:${status.id}] ${status.name} (${status.emoji})
                    - ${status.description}
                `);
                break;
            }
            default: {
                //
            }
        }
    }
}