import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Status } from "../../../Database/entity/Status";
import { StatusOwned } from "../../../Database/entity/StatusOwned";
import { User } from "../../../Database/entity/User";
import IncorrectArgumentsError from "../../../Errors/IncorrectArguments";
import MissingArgumentsError from "../../../Errors/MissingArguments";
import NotFoundError from "../../../Errors/NotFound";
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
            throw new MissingArgumentsError("nope.");

        const cmd = args.shift().toLowerCase();
        
        switch(cmd) {
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
                    throw new NotFoundError(`Статуса с таким ID не существует`);
                await StatusOwned.delete({ status: { id } });
                let users = await User.find({ where: { status: { id } } });
                for(let user of users) {
                    await addNotification(vk, user.id, `
                        Используемый [id${user.id}|Вами] статус был удалён!
                        ${status.name} (${status.emoji})
                    `)
                }
                await User.update({ status: { id } }, { status: null });
                await status.remove();
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
                let res = await StatusOwned.delete({ user: { id: userId }, status: { id: statusId } })
                let status = await Status.findOne({
                    where: { id: statusId }
                });
                await User.update({
                    id: userId,
                    status: { id: statusId }
                }, {
                    status: null
                });
                
                if(!res.affected)
                    throw new NotFoundError("У пользователя нет этого статуса!");
                else {
                    await addNotification(vk, userId, `
                        [id${userId}|Вы] потеряли статус!
                        ${status.name} (${status.emoji})
                    `);
                    message.reply(`Удалён статус ID: ${statusId} у пользователя ${userId}`);
                }
                break;
            }
            case "list": {
                let [ page = 1 ] = args.map(Number);
                if(page < 1)
                    throw new IncorrectArgumentsError("Некорректная страница");
                let statuses = await Status.find({
                    take: 10, skip: 10 * (page - 1), order: { id: "ASC" }
                });
                let total = await Status.count();
                if(statuses.length == 0)
                    throw new NotFoundError("Не найдено статусов");
                return message.reply(`
                    Статусы:
                    ${statuses.map(s => `[ID:${s.id}] ${s.name} (${s.emoji})}`).join('\n')}
                    Страница ${page} из ${Math.ceil(total / 10)}
                `);
            }

            default: {
                let status = await Status.findOne({
                    where: [
                        { id: Number(cmd) },
                        { name: cmd },
                        { emoji: cmd }
                    ]
                });
                if(!status)
                    throw new NotFoundError("Такого статуса не существует!");
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