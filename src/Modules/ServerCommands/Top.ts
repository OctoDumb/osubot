import ServerCommand from "../../Commands/Server/ServerCommand";
import Message from "../../Message";
import Bot from "../../Bot";
import { IServerCommandArguments, ITopCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import { defaultArguments, modsToString } from "../../Util";
import { TopTemplate, TopSingleTemplate } from "../../Templates";

export default class TopCommand extends ServerCommand {
    name = "Top";
    command = [ "top", "t", "ещз", "е" ];

    description = "Посмотреть топ 3 ваших скоров";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<ITopCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.mods,
                Parsers.place,
                Parsers.approximate,
                Parsers.morethan
            ])
        };
    }

    async run({ message, database, privileges, mapAPI, clean, args }: IServerCommandArguments<ITopCommandArguments>) {
        let { nickname: username, mode } = await this.database.getUser(message.sender);
        if(clean) username = clean;

        let user = await this.api.getUser({ username });

        let users = await this.database.findByUserId(user.id);
        let status = privileges.getUserStatus(users);
        
        let top = await this.api.getTop({ 
            username, 
            limit: 100,
            mode: args.mode ?? mode
        });

        if(args.morethan) {
            let amount = top.filter(t => t.pp >= args.morethan).length;
            message.reply(`У игрока ${user.username} ${amount} скоров больше ${args.morethan}pp`);
        } else if(args.place) {
            if(args.place > 100)
                return message.reply("100!!!");

            let t = top[args.place - 1];

            let map = await mapAPI.getBeatmap(t.beatmapId, modsToString(t.mods));

            let cover = await database.covers.getCover(map.beatmapsetID);

            let msg = TopSingleTemplate(this.module, user.username, t, args.place, map, status);
            
            message.reply(msg, {
                attachment: cover
            });
        } else {
            if(args.mods != undefined)
                top = top.filter(t => t.mods == args.mods);
            top = top.splice(0, 3);

            let maps = await Promise.all([ ...top.map(t => mapAPI.getBeatmap(t.beatmapId, modsToString(t.mods))) ])

            let msg = TopTemplate(this.module, user.username, top, maps, status);

            message.reply(msg);
        }
    }
}