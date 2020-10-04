import { AttachmentType, MessageContext } from "vk-io";

import Bot from "./Bot";
import ServerModule from "./Commands/Server/ServerModule";
import { MapInfoTemplate } from "./Templates";

interface IMapLink {
    beatmapsetId?: number;
    beatmapId?: number;
}

export default class MapLinkProcessor {
    constructor(
        private bot: Bot
    ) {}

    api = this.bot.v2;

    checkLink(ctx: MessageContext): IMapLink | null {
        let variations = [
            'beatmapsets/(?<setId>[0-9]+)#\d+/(?<mapId>[0-9]+)',
            'b/(?<mapId>[0-9]+)',
            's/(?<setId>[0-9]+)'
        ];
        let rx = this.bot.modules
            .filter(m => m instanceof ServerModule)
            .flatMap ((m: ServerModule) => variations.map(v => new RegExp(`${m.baseLink}${v}`)));

        for(let r of rx) {
            if(r.exec(ctx.text)) {
                let g = ctx.text.match(r).groups;
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

    async process(ctx: MessageContext, mapLink: IMapLink) {
        let { beatmapsetId, beatmapId } = mapLink;
        
        if (beatmapsetId) {
            let data = await this.api.getBeatmapset({ beatmapsetId });
        } else if (beatmapId) {
            let map = await this.bot.maps.getBeatmap(beatmapId);
            let pp98 = await this.bot.maps.getPP(beatmapId, { acc: 98 });
            let pp99 = await this.bot.maps.getPP(beatmapId, { acc: 99 });
            let cover = await this.bot.database.covers.getCover(map.beatmapsetID);
            ctx.send(MapInfoTemplate(map, pp98, pp99), {
                attachment: cover
            });
        } else {
            ctx.send("Некорректная ссылка");
        }
    }
}