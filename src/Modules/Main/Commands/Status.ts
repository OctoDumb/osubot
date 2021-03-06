import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";
import { Status } from "../../../Database/entity/Status";
import { StatusOwned } from "../../../Database/entity/StatusOwned";
import { User } from "../../../Database/entity/User";
import IncorrectArgumentsError from "../../../Errors/IncorrectArguments";
import MissingArgumentsError from "../../../Errors/MissingArguments";
import NotFoundError from "../../../Errors/NotFound";

export default class MainStatus extends Command {
    name = "Status";
    command = [ "status", "ыефегы" ];

    delay = 0;
    description = "";

    async run({ message, database }: ICommandArguments) {
        let args = message.arguments;
        
        if(!args[0])
            throw new MissingArgumentsError("nope.");

        switch(args.shift().toLowerCase()) {
            case "list": {
                let [ page = 1 ] = args.map(Number);
                if(page < 1)
                    throw new IncorrectArgumentsError("Некорректная страница");
                let owned = await StatusOwned.find({
                    where: { user: { id: message.sender } },
                    relations: [ 'status' ],
                    take: 10,
                    skip: 10 * (page - 1)
                });

                let ownedCount = await StatusOwned.count({ where: { user: { id: message.sender } } });
                if(!owned.length)
                    if(ownedCount == 0)
                        throw new NotFoundError("У вас нет статусов!");
                    else
                        throw new NotFoundError("Страница не найдена");
                
                let statuses = owned.map(o => o.status);
                message.reply(`
                    Доступные статусы:
                    ${statuses.map(s => `[ID:${s.id}] ${s.name} (${s.emoji})`)}
                    Страница ${page} из ${Math.ceil(ownedCount / 10)}
                `);
                break;
            }
            case "set": {
                let [ st ] = args;
                let status = await Status.findOne({
                    where: [
                        { id: Number(st) },
                        { name: st },
                        { emoji: st }
                    ]
                });
                let owned = await StatusOwned.findOne({
                    where: {
                        user: { id: message.sender },
                        status
                    }
                });
                if(!owned)
                    throw new NotFoundError("У вас нет этого статуса!");
                await User.update({
                    id: message.sender
                }, { status })
                message.reply(`
                    Установлен статус ${status.name} (${status.emoji})
                `);
                break;
            }
            case "info": {
                let [ st ] = args;
                let status = await Status.findOne({
                    where: [
                        { id: Number(st) },
                        { name: st },
                        { emoji: st }
                    ]
                });
                message.reply(`
                    [ID:${status.id}] ${status.name} (${status.emoji})
                    - ${status.description}
                `);
                break;
            }
            case "reset": {
                await User.update({ id: message.sender }, { status: null });
                message.reply("Статус сброшен!");
                break;
            }
            default: {
                //
            }
        }
    }
}