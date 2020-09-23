import { IAPIWithScores } from "../../API/ServerAPI";
import Bot from "../../Bot";
import { ICompareCommandArguments, IServerCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import Message from "../../Message";
import { CompareScoreTemplate } from "../../Templates";
import { defaultArguments, getUserInfo, modsEqual, modsToString } from "../../Util";

export default class CompareCommand extends ServerCommand {
    api: IAPIWithScores;

    name = "Compare";
    command = ["c", "compare"];

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

    async run({ message, mapAPI, clean, args, chats }: IServerCommandArguments<ICompareCommandArguments>) {
        let { username } = await getUserInfo(message, this.database, clean, args);

        let beatmapId = chats.getChatMap(message.peerId);
        if(!beatmapId)
            return message.reply("Отправьте карту!");

        let scores = await this.api.getScores({
            username,
            beatmapId
        });

        console.log(args);

        let score = args.mods !== undefined
            ? scores.find(s => modsEqual(s.mods, args.mods))
            : scores.sort((a, b) => a.score - b.score)[0];

        if(!score)
            return message.reply("Скор не найден!");

        let mods = modsToString(score.mods);

        let map = await mapAPI.getBeatmap(beatmapId, mods);

        let pp = await mapAPI.getPP(beatmapId, {
            combo: score.maxCombo,
            miss: score.counts.miss,
            acc: score.accuracy * 100,
            score: score.score,
            mods: mods.join(",")
        })

        let msg = CompareScoreTemplate(this.module, score, pp, map);

        message.reply(msg);
    }
}