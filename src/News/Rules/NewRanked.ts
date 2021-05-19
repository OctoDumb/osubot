import { IV2Beatmapset } from "../../API/Servers/V2/V2Responses";
import { Cover } from "../../Database/entity/Cover";
import NewsRule, { executeFilter, IFilter, INewsSendParams } from "../NewsRule";

export default class NewRankedRule extends NewsRule<IV2Beatmapset> {
    name = "newranked";

    userDefault = false;
    chatDefault = false;

    async createMessage(mapset: IV2Beatmapset): Promise<INewsSendParams> {
        let modes = [];
        const m = ["osu!", "osu!taiko", "osu!catch", "osu!mania"];

        for (let i = 0; i <= 3; i++) {
            if (mapset.beatmaps.filter(map => map.mode == i).length) {
                modes.push({
                    mode: m[i],
                    min: Math.min(...mapset.beatmaps.filter(map => map.mode == i).map(map => map.stars)),
                    max: Math.max(...mapset.beatmaps.filter(map => map.mode == i).map(map => map.stars))
                });
            }
        }

        return {
            message: `Новая ранкнутая карта!
            
            ${mapset.artist} - ${mapset.title} by ${mapset.creator}
            ${modes.map(mode => `${mode.mode} [${mode.min == mode.max ? mode.min : `${mode.min}-${mode.max}`}]`).join(", ")}
            
            https://osu.ppy.sh/s/${mapset.id}`,
            attachment: await Cover.get(this.bot.vk, mapset.id)
        }
    }

    hasFilters = true;

    private modes = ["osu", "taiko", "catch", "mania"];

    useFilter(object: IV2Beatmapset, filter: IFilter) {
        if(filter.name == "creator" && filter.operator == "=") {
            return object.creator.toLowerCase() == filter.value.toLowerCase();
        }
        
        if(filter.name == "mode" && filter.operator == "=") {
            return object.beatmaps.some(m => String(m.mode) == filter.value || filter.value == this.modes[m.mode]);
        }
        if(filter.name == "stars") {
            return object.beatmaps.some(m => executeFilter(m.stars, filter));
        }

        return true;
    }
}