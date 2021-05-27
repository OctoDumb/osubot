import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Status } from "../../../Database/entity/Status";
import { StatusOwned } from "../../../Database/entity/StatusOwned";
import { User } from "../../../Database/entity/User";
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
                let status = await Status.create({
                    name, emoji,
                    description: description.join(" ")
                }).save();
                message.reply(`
                    Статус ${name} (${emoji}) создан. ID: ${status.id}
                `)
                break;
            }
            case "delete": {
                let id = Number(args[0]);
                let status = await Status.findOne({
                    where: { id }
                });
                if(!status)
                    return message.reply(`Статуса с таким ID не существует`);
                await status.remove();
                await StatusOwned.delete({ status: { id } });
                message.reply(`
                    Статус ${status.name} (${status.emoji}) удалён.
                `);
                break;
            }
            case "give": {
                let [ userId, st ] = args;
                let status = await Status.findOne({
                    where: [
                        { id: Number(st) },
                        { name: st },
                        { emoji: st }
                    ]
                });

                await StatusOwned.create({
                    user: { id: Number(userId) },
                    status: { id: status.id }
                }).save();

                await addNotification(vk, Number(userId), `
                    [id${userId}|Вы] получили новый статус!
                    ID:${status.id} ${status.name} (${status.emoji})
                    - ${status.description}
                `);

                message.reply(`[id${userId}|Пользователю] выдан статус ${status.name} (${status.emoji})`);
                break;
            }
            case "remove": {
                let [ userId, statusId ] = args.map(Number);
                let [ owned, count ] = await StatusOwned.findAndCount({
                    where: {
                        user: { id: userId },
                        status: { id: statusId }
                    }
                });
                await StatusOwned.remove(owned);
                let status = await Status.findOne({
                    where: { id: statusId }
                });
                await User.update({
                    status: { id: statusId }
                }, {
                    status: null
                });
                await addNotification(vk, userId, `
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
                let statuses = await Status.find({
                    take: 10, skip: 10 * (page - 1), order: { id: "ASC" }
                });
                let total = await Status.count();
                if(statuses.length == 0)
                    return message.reply("Не найдено статусов");
                return message.reply(`
                    Статусы:
                    ${statuses.map(s => `[ID:${s.id}] ${s.name} (${s.emoji})}`).join('\n')}
                    Страница ${page} из ${Math.ceil(total / 10)}
                `);
            }
            default: {
                let status = await Status.findOne({
                    where: [
                        { id: Number(args[0]) },
                        { name: args[0] },
                        { emoji: args[0] }
                    ]
                });
                if(!status)
                    return message.reply("Такого статуса не существует!");
                let ownedBy = await StatusOwned.count({
                    where: { status: { id: status.id } }
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