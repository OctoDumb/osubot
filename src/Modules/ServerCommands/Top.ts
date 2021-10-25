import ServerCommand from "../../Commands/Server/ServerCommand";
import Message from "../../Message";
import Bot from "../../Bot";
import { IServerCommandArguments, IServerCommandWithCardArguments, ITopCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import { defaultArguments, getStatus, getUserInfo, modsToString } from "../../Util";
import { TopTemplate, TopSingleTemplate } from "../../Templates";
import { Stats } from "../../Database/entity/Stats";
import { Cover } from "../../Database/entity/Cover";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import IncorrectArgumentsError from "../../Errors/IncorrectArguments";
import NotFoundError from "../../Errors/NotFound";
import MissingArgumentsError from "../../Errors/MissingArguments";
import ServerCommandWithCard from "../../Commands/Server/ServerCommandWithCard";
import ScoreCardGenerator from "../../Cards/ScoreCardGenerator";
import TopCardGenerator from "../../Cards/TopCardGenerator";

export default class TopCommand extends ServerCommandWithCard<OsuAPI> {
    name = "Top";
    command = [ "top", "t", "ещз", "е" ];

    description = "Посмотреть топ 3 ваших скоров";

    parseArguments(message: Message, bot: Bot): IServerCommandWithCardArguments<ITopCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.mods,
                Parsers.place,
                Parsers.approximate,
                Parsers.morethan,
                Parsers.card
            ])
        };
    }

    async run({ message, database, mapAPI, chats, clean, vk, args }: IServerCommandWithCardArguments<ITopCommandArguments>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        if(!username)
            throw new MissingArgumentsError("Не указан ник!");
        
        let user = await this.api.getUser({ username, mode });

        await Stats.updateInfo(this.module.name, user, mode);

        let status = await getStatus(user.id);
        
        let top = await this.api.getTop({ 
            username, 
            limit: 100,
            mode: args.mode ?? mode
        });

        if(args.morethan) {
            let amount = top.filter(t => t.pp >= args.morethan).length;
            message.reply(`У игрока ${user.username} ${amount} скоров больше ${args.morethan}pp`);
        } else if(args.approximate) {
            let index = 0;
            let diff = Math.abs(top[index].pp - args.approximate);
            for(let i = 0; i < top.length; i++) {
                let newDiff = Math.abs(top[i].pp - args.approximate);
                if(newDiff < diff) {
                    index = i;
                    diff = newDiff;
                }
            }
            let score = top[index];

            let map = await mapAPI.getBeatmap(score.beatmapId, modsToString(score.mods));

            if(args.card) {
                let pp = await mapAPI.getPP(score.beatmapId, {
                    combo: score.maxCombo,
                    miss: score.counts.miss,
                    n50: score.counts[50],
                    acc: score.accuracy * 100,
                    score: score.score,
                    mods: modsToString(score.mods).join()
                });
                return this.sendCard(ScoreCardGenerator, {
                    vk, message,
                    obj: {
                        player: user,
                        score, map, pp
                    }
                });
            }

            let attachment = await Cover.get(vk, map.beatmapsetID);
            
            let msg = TopSingleTemplate(this.module, user.username, score, index + 1, map, status);

            chats.setChatMap(message.peerId, score.beatmapId);

            message.reply(msg, {
                attachment
            });
        } else if(args.place) {
            if(args.place > 100 || args.place < 1)
                throw new IncorrectArgumentsError("Некорректное место! (1-100)");

            if(args.place > top.length)
                throw new NotFoundError("Такого скора нет!")

            let score = top[args.place - 1];

            let map = await mapAPI.getBeatmap(score.beatmapId, modsToString(score.mods));

            if(args.card) {
                let pp = await mapAPI.getPP(score.beatmapId, {
                    combo: score.maxCombo,
                    miss: score.counts.miss,
                    n50: score.counts[50],
                    acc: score.accuracy * 100,
                    score: score.score,
                    mods: modsToString(score.mods).join()
                });
                return this.sendCard(ScoreCardGenerator, {
                    vk, message,
                    obj: {
                        player: user,
                        score, map, pp
                    }
                });
            }

            let attachment = await Cover.get(vk, map.beatmapsetID);

            let msg = TopSingleTemplate(this.module, user.username, score, args.place, map, status);

            chats.setChatMap(message.peerId, score.beatmapId);
            
            message.reply(msg, {
                attachment
            });
        } else {
            if(args.card) {
                top = top.splice(0, 5);
                if(!top.length)
                    throw new NotFoundError("Не найдено скоров с данной комбинацией модов!");

                let maps = await Promise.all(top.map(t => mapAPI.getBeatmap(t.beatmapId, modsToString(t.mods))));

                return this.sendCard(TopCardGenerator, {
                    vk, message,
                    obj: {
                        player: user,
                        top, maps
                    }
                });
            }

            if(args.mods != undefined)
                top = top.filter(t => t.mods == args.mods);
            top = top.splice(0, 3);

            if(!top.length)
                throw new NotFoundError("Не найдено скоров с данной комбинацией модов!");

            let maps = await Promise.all(top.map(t => mapAPI.getBeatmap(t.beatmapId, modsToString(t.mods))));

            let msg = TopTemplate(this.module, user.username, top, maps, status);

            message.reply(msg);
        }
    }
}