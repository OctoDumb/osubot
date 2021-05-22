import { IChangelog } from "../../API/Osu/Servers/V2/V2Responses";
import NewsRule, { IFilter, INewsSendParams } from "../NewsRule";

export default class OsuUpdateRule extends NewsRule<IChangelog> {
    name = "osuupdate";

    userDefault = false;
    chatDefault = false;

    async createMessage(update: IChangelog): Promise<INewsSendParams> {
        let changes = {};
        for(let change of update.entries) {
            changes[change.category] = (changes[change.category] ?? 0) + 1;
        }
        let changesString = [];
        for(let ch in changes) {
            changesString.push(`[${ch}]: [${changes[ch]}]`);
        }

        let hasMajors = update.entries.some(e => e.isMajor);

        let message = `🔔 Новое обновление osu! (${update.version})${hasMajors ? `\n❗ Есть важные изменения!` : ''}
        ${changesString.join("\n")}
        https://osu.ppy.sh/home/changelog/stable40/${update.version}`;

        return { message };
    }

    hasFilters = false;
    
    useFilter(object: IChangelog, filter: IFilter): boolean {
        return true;
    }
}