import { AttachmentType, MessageContext } from "vk-io";

import Bot from "./Bot";
import ServerModule from "./Commands/Server/ServerModule";
import { MapInfoTemplate, MapsetInfoTemplate } from "./Templates";
import { IV2Beatmapset } from "./API/Servers/V2/V2Responses";
import Message from "./Message";
import { getCover } from "./Util";

interface IMapLink {
    beatmapsetId?: number;
    beatmapId?: number;
}

export default class MapLinkProcessor {
    constructor(
        private bot: Bot
    ) {}

    api = this.bot.v2;

    checkLink(message: Message, ctx: MessageContext): IMapLink | null {
        let regExps = [
            /beatmapsets\/(?<setId>\d+)#\D+\/(?<mapId>\d+)/,
            /b\/(?<mapId>\d+)/,
            /s\/(?<setId>\d+)/,
        ];

        for(let r of regExps) {
            let [firstLine] = message.clean.split("\n");

            if(r.test(firstLine)) {
                let g = firstLine.match(r).groups;
                return {
                    beatmapsetId: Number(g.setId),
                    beatmapId: Number(g.mapId)
                }
            }

            for(let a of ctx.getAttachments(AttachmentType.LINK)) {
                if(r.exec(a.url)) {
                    let g = a.url.match(r).groups;
                    return {
                        beatmapsetId: Number(g.setId),
                        beatmapId: Number(g.mapId)
                    }
                }
            }
        }

        return null;
    }

    async process(message: Message, mapLink: IMapLink) {
        let { beatmapsetId, beatmapId } = mapLink;
        
        if (beatmapsetId && !beatmapId) {
            let mapset = await this.api.getBeatmapset({ beatmapsetId });
            let attachment = await getCover(this.bot.database, this.bot.vk, beatmapsetId);
            mapset = this.cutBeatmapset(mapset);

            message.reply(MapsetInfoTemplate(mapset), {
                attachment
            });
        } else if (beatmapId) {
            let map = await this.bot.maps.getBeatmap(beatmapId);
            let pp98 = await this.bot.maps.getPP(beatmapId, { acc: 98 });
            let pp99 = await this.bot.maps.getPP(beatmapId, { acc: 99 });
            let attachment = await getCover(this.bot.database, this.bot.vk, map.beatmapsetID);

            this.bot.lastMaps.setChatMap(message.peerId, beatmapId);

            message.reply(MapInfoTemplate(map, pp98, pp99), {
                attachment
            });
        } else {
            message.reply("Некорректная ссылка");
        }
    }

    private cutBeatmapset(set: IV2Beatmapset): IV2Beatmapset {
        set.beatmaps = set.beatmaps.sort((a, b) => a.stars - b.stars);

        const count = 3;
        let std = set.beatmaps.filter(b => b.mode === 0).splice(-count);
        let taiko = set.beatmaps.filter(b => b.mode === 1).splice(-count);
        let ctb = set.beatmaps.filter(b => b.mode === 2).splice(-count);
        let mania = set.beatmaps.filter(b => b.mode === 3).splice(-count);

        set.beatmaps = [
            ...std,
            ...taiko,
            ...ctb,
            ...mania
        ];

        return set;
    }
}