import { IV2News } from "../../API/Osu/Servers/V2/V2Responses";
import NewsRule, { IFilter, INewsSendParams } from "../NewsRule";

export default class OsuNewsRule extends NewsRule<IV2News> {
    name = "osunews";

    userDefault = false;
    chatDefault = false;

    async createMessage(news: IV2News): Promise<INewsSendParams> {
        let attachment = (await this.bot.vk.upload.messagePhoto({
            source: news.image
        })).toString();

        return {
            message: `Новость на сайте osu!\n${news.title}\nот ${news.author}\n\n${news.link}`,
            attachment
        };
    }

    hasFilters = false;
    
    useFilter(object: IV2News, filter: IFilter): boolean {
        return true;
    }
}