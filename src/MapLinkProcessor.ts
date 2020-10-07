import { AttachmentType, MessageContext } from "vk-io";

import Bot from "./Bot";
import ServerModule from "./Commands/Server/ServerModule";
import { MapInfoTemplate, MapsetInfoTemplate } from "./Templates";
import { IV2Beatmapset } from "./API/Servers/V2/V2Responses";
import Message from "./Message";

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
        let variations = [
            'beatmapsets/(?<setId>[0-9]+)#\d+/(?<mapId>[0-9]+)',
            'b/(?<mapId>[0-9]+)',
            's/(?<setId>[0-9]+)'
        ];
        let rx = this.bot.modules
            .filter(m => m instanceof ServerModule)
            .flatMap ((m: ServerModule) => variations.map(v => new RegExp(`${m.baseLink}${v}`)));

        for(let r of rx) {
            if(r.exec(message.clean)) {
                let g = message.clean.match(r).groups;
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
        
        if (beatmapsetId) {
            let mapset = await this.api.getBeatmapset({ beatmapsetId });
            let cover = await this.bot.database.covers.getCover(beatmapsetId);
            mapset = this.cutBeatmapset(mapset);

            message.reply(MapsetInfoTemplate(mapset), {
                attachment: cover
            });
        } else if (beatmapId) {
            let map = await this.bot.maps.getBeatmap(beatmapId);
            let pp98 = await this.bot.maps.getPP(beatmapId, { acc: 98 });
            let pp99 = await this.bot.maps.getPP(beatmapId, { acc: 99 });
            let cover = await this.bot.database.covers.getCover(map.beatmapsetID);

            this.bot.lastMaps.setChatMap(message.peerId, beatmapId);

            message.reply(MapInfoTemplate(map, pp98, pp99), {
                attachment: cover
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