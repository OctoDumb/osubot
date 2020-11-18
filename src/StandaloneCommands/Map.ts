import Bot from "../Bot";
import { IMapCommandArguments, IStandaloneCommandArguments, parseArguments, Parsers } from "../Commands/Arguments";
import StandaloneCommand from "../Commands/StandaloneCommand";
import Message from "../Message";
import { MapTemplate } from "../Templates";
import { clearObject, defaultArguments, modsToString } from "../Util";

export default class MapCommand extends StandaloneCommand {
    name = "Map";
    command = [ "map" ];

    description = "";

    parseArguments(message: Message, bot: Bot) {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [
                Parsers.accuracy,
                Parsers.combo,
                Parsers.miss,
                Parsers.mods
            ])
        }
    }

    async run({ message, database, chats, mapAPI, args, clean }: IStandaloneCommandArguments<IMapCommandArguments>) {
        let id = chats.getChatMap(message.peerId);
        if(!id)
            throw "Отправьте карту!";

        let mods = modsToString(args.mods);
        
        let map = await mapAPI.getBeatmap(id, mods);

        let pp = await mapAPI.getPP(id, clearObject({
            acc: args.accuracy,
            combo: args.combo,
            miss: args.miss,
            score: Number(clean),
            mods: mods.join(",")
        }));

        let cover = await database.covers.getCover(map.beatmapsetID);

        let msg = MapTemplate(map, pp, mods);

        message.reply(msg, {
            attachment: cover
        });
    }
}