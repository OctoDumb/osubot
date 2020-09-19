import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments, parseArguments, Parsers, IRecentCommandArguments } from "../../Commands/Arguments";
import Message from "../../Message";
import Bot from "../../Bot";
import { defaultArguments, getUserInfo, modsToString } from "../../Util";
import { RecentTemplate } from "../../Templates";

export default class BanchoRecent extends ServerCommand {
    name = "Recent";
    command = [ "r", "rp", "recent", "к", "кз", "кусуте" ];

    description = "Последний плей";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IRecentCommandArguments> {
        let args = defaultArguments(message, bot);
        return {
            ...args,
            ...parseArguments(message.arguments, [
                Parsers.mode,
                Parsers.pass
            ])
        };
    }

    async run({ message, mapAPI, clean, args, chats }: IServerCommandArguments<IRecentCommandArguments>) {
        let { username, mode } = await getUserInfo(message, this.database, clean, args);

        let [ recent ] = await this.api.getRecent({ username, mode, pass: args.pass });

        if(!recent) return message.reply("no recent");

        let mods = modsToString(recent.mods);

        let map = await mapAPI.getBeatmap(recent.beatmapId, mods);
        chats.setChatMap(message.peerId, recent.beatmapId);

        let pp = await mapAPI.getPP(recent.beatmapId, {
            combo: recent.maxCombo,
            miss: recent.counts.miss,
            acc: recent.accuracy * 100,
            score: recent.score,
            mods: mods.join()
        });

        let msg = RecentTemplate(this.module, recent, map, pp);

        message.reply(msg);
    }
}