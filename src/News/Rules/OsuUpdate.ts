import { IBeatmap } from "../../API/MapAPI";
import NewsRule, { executeFilter, IFilter, INewsSendParams } from "../NewsRule";

export default class OsuUpdateRule extends NewsRule<IBeatmap> {
    name = "osuupdate";

    userDefault = false;
    chatDefault = false;

    async createMessage(map: IBeatmap): Promise<INewsSendParams> {
        let attachment = await this.bot.database.covers.getCover(1337228);

        return {
            message: map.title,
            attachment
        };
    }

    hasFilters = true;
    
    useFilter(map: IBeatmap, filter: IFilter): boolean {
        if(filter.name == "bpm") {
            return executeFilter(map.bpm.avg, filter);
        }

        return true;
    }
}