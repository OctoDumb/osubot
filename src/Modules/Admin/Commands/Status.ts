import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Permission } from "../../../Permissions";
import { addNotification } from "../../../Util";

export default class AdminStatus extends Command {
    name = "Status";
    command = [ "status" ];

    permission = Permission.ADMIN;

    delay = 0;
    description = "";

    async run({ message, database, vk }: ICommandArguments) {
        let args = message.arguments;

        if(!args[0])
            return message.reply("nope.");
        
        switch(args.shift().toLowerCase()) {
            case "create": {
                let [ emoji, name, ...description ] = args;
                let status = await database.status.create({
                    data: {
                        name, emoji,
                        description: description.join(" ")
                    }
                });
                message.reply(`
                    Статус ${name} (${emoji}) создан. ID: ${status.id}
                `)
                break;
            }
            case "delete": {
                let id = Number(args[0]);
                let status = await database.status.delete({
                    where: { id }
                });
                message.reply(`
                    Статус ${status.name} (${status.emoji}) удалён.
                `);
                break;
            }
            case "give": {
                let [ userId, st ] = args;
                let status = await database.status.findFirst({
                    where: {
                        OR: [
                            { id: Number(st) },
                            { emoji: st }
                        ]
                    }
                });

                await database.statusOwned.create({
                    data: {
                        userId: Number(userId), statusId: status.id
                    }
                });

                await addNotification(vk, database, Number(userId), `
                    [id${userId}|Вы] получили новый статус!
                    ID:${status.id} ${status.name} (${status.emoji})
                    - ${status.description}
                `);

                message.reply(`[id${userId}|Пользователю] выдан статус ${status.name} (${status.emoji})`);
                break;
            }
            case "remove": {
                let [ userId, statusId ] = args.map(Number);
                let { count } = await database.statusOwned.deleteMany({
                    where: {
                        userId, statusId
                    }
                });
                let status = await database.status.findUnique({
                    where: { id: statusId }
                });
                await database.user.updateMany({
                    where: { statusId },
                    data: { statusId: null }
                })
                await addNotification(vk, database, userId, `
                    [id${userId}|Вы] потеряли статус!
                    ${status.name} (${status.emoji})
                `);
                if(!count)
                    message.reply("У пользователя нет этого статуса!");
                else
                    message.reply(`Удалён статус ID: ${statusId} у пользователя ${userId}`);
                break;
            }
            case "list": {
                let [ page = 1 ] = args.map(Number);
                if(page < 1)
                    return message.reply("Некорректная страница");
                let statuses = await database.status.findMany({
                    take: 10, skip: 10 * (page - 1), orderBy: { id: "asc" }
                });
                let total = await database.status.count();
                if(statuses.length == 0)
                    return message.reply("Не найдено статусов");
                return message.reply(`
                Статусы:
                ${statuses.map(s => `[ID:${s.id}] ${s.name} (${s.emoji})}`).join('\n')}
                Страница ${page} из ${Math.ceil(total / 10)}
                `);
                break;
            }
            default: {
                let status = await database.status.findFirst({
                    where: {
                        OR: [
                            { id: Number(args[0]) },
                            { emoji: args[0] }
                        ]
                    }
                });
                if(!status)
                    return message.reply("Такого статуса не существует!");
                let ownedBy = await database.statusOwned.count({ 
                    where: { statusId: status.id } 
                });
                message.reply(`
                    [ID: ${status.id}] ${status.name} (${status.emoji})
                    Имеют ${ownedBy} пользователей
                    
                    ${status.description}
                `);
            }
        }
    }
}