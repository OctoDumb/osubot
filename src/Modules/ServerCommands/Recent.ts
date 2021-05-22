import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments, parseArguments, Parsers, IRecentCommandArguments } from "../../Commands/Arguments";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments, getUserInfo, hitsToFail, modsToString } from "../../Util";
import { RecentTemplate } from "../../Templates";
import { Cover } from "../../Database/entity/Cover";
import { OsuAPI } from "../../API/Osu/OsuServerAPI";

export default class RecentCommand extends ServerCommand<OsuAPI> {
    name = "Recent";
    command = [ "r", "rp", "recent", "к", "кз", "кусуте" ];

    description = "Последний плей";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IRecentCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.place,
                Parsers.pass
            ])
        };
    }

    async run({ message, database, mapAPI, clean, args, vk, chats }: IServerCommandArguments<IRecentCommandArguments>) {
        let { username, mode } = await getUserInfo(message, this.module.name, database, clean, args);

        let recents = await this.api.getRecent({ 
            username, 
            mode: args.mode ?? mode, 
            pass: args.pass,
            limit: args.place ?? 1
        });

        let recent = recents[args.place ? args.place - 1 : 0];

        if(!recent) return message.reply("no recent");

        let mods = modsToString(recent.mods);

        let map = await mapAPI.getBeatmap(recent.beatmapId, mods);
        chats.setChatMap(message.peerId, recent.beatmapId);

        let attachment = await Cover.get(vk, map.beatmapsetID);

        let pp = await mapAPI.getPP(recent.beatmapId, {
            combo: recent.maxCombo,
            miss: recent.counts.miss,
            acc: recent.accuracy * 100,
            score: recent.score,
            mods: mods.join(),
            fail: hitsToFail(recent.counts, recent.mode)
        });

        let msg = RecentTemplate(this.module, recent, map, pp);

        message.reply(msg, {
            attachment
        });
    }
}