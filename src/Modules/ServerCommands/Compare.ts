import { OsuAPIWithScores } from "../../API/Osu/OsuServerAPI";
import Bot from "../../Bot";
import { ICompareCommandArguments, IServerCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import NotFoundError from "../../Errors/NotFound";
import Message from "../../Message";
import { CompareScoreTemplate } from "../../Templates";
import { defaultArguments, getUserInfo, modsEqual, modsToString } from "../../Util";

export default class CompareCommand extends ServerCommand<OsuAPIWithScores> {
    name = "Compare";
    command = ["c", "compare", "с", "сщьзфку"];

    description = "";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<ICompareCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mods
            ])
        };
    }

    async run({ message, database, mapAPI, clean, args, chats }: IServerCommandArguments<ICompareCommandArguments>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        let beatmapId = chats.getChatMap(message.peerId);
        if(!beatmapId)
            throw new NotFoundError("Не найдена карта!");

        let scores = await this.api.getScores({
            username, mode,
            beatmapId
        });

        let score = args.mods !== undefined
            ? scores.find(s => modsEqual(s.mods, args.mods))
            : scores.sort((a, b) => b.score - a.score)[0];

        if(!score)
            throw new NotFoundError("Скор не найден!");

        let mods = modsToString(score.mods);

        let map = await mapAPI.getBeatmap(beatmapId, mods);

        let pp = await mapAPI.getPP(beatmapId, {
            combo: score.maxCombo,
            miss: score.counts.miss,
            n50: score.counts[50],
            acc: score.accuracy * 100,
            score: score.score,
            mods: mods.join(",")
        })

        let msg = CompareScoreTemplate(this.module, score, pp, map);

        message.reply(msg);
    }
}