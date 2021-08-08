import { parseArguments, Parsers, IRecentCommandArguments, IServerCommandWithCardArguments } from "../../Commands/Arguments";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments, getUserInfo, hitsToFail, modsToString } from "../../Util";
import { RecentTemplate } from "../../Templates";
import { Cover } from "../../Database/entity/Cover";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";
import NotFoundError from "../../Errors/NotFound";
import MissingArgumentsError from '../../Errors/MissingArguments';
import ServerCommandWithCard from "../../Commands/Server/ServerCommandWithCard";
import ScoreCardGenerator, { IScoreCardArguments } from "../../Cards/ScoreCardGenerator";

export default class RecentCommand extends ServerCommandWithCard<OsuAPI, IScoreCardArguments> {
    name = "Recent";
    command = [ "r", "rp", "recent", "к", "кз", "кусуте" ];

    description = "Последний плей";

    protected readonly cardGenerator = new ScoreCardGenerator();

    parseArguments(message: Message, bot: Bot): IServerCommandWithCardArguments<IRecentCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.place,
                Parsers.pass,
                Parsers.card
            ])
        };
    }

    async run({ message, database, mapAPI, clean, args, vk, chats }: IServerCommandWithCardArguments<IRecentCommandArguments>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        if(!username)
            throw new MissingArgumentsError("Не указан ник!");

        let recents = await this.api.getRecent({ 
            username, 
            mode: args.mode ?? mode, 
            pass: args.pass,
            limit: args.place ?? 1
        });

        let recent = recents[args.place ? args.place - 1 : 0];

        if(!recent)
            throw new NotFoundError("Не найдено последних плеев!");

        let mods = modsToString(recent.mods);

        let map = await mapAPI.getBeatmap(recent.beatmapId, mods);
        chats.setChatMap(message.peerId, recent.beatmapId);

        let pp = await mapAPI.getPP(recent.beatmapId, {
            combo: recent.maxCombo,
            miss: recent.counts.miss,
            n50: recent.counts[50],
            acc: recent.accuracy * 100,
            score: recent.score,
            mods: mods.join(),
            fail: hitsToFail(recent.counts, recent.mode)
        });

        if(args.card) {
            let player = await this.api.getUser({ username });
            return this.sendCard({ vk, message, obj: {
                player,
                score: recent, 
                map, pp
            }})
        }

        let attachment = await Cover.get(vk, map.beatmapsetID);

        let msg = RecentTemplate(this.module, recent, map, pp);

        message.reply(msg, {
            attachment
        });
    }
}