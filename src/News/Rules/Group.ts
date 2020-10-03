import NewsRule, { IFilter, INewsSendParams } from "../NewsRule";

export interface INewsMessage {
    message: string;
    attachment?: string;
}

export default class GroupRule extends NewsRule<INewsMessage> {
    name = "group";

    userDefault = false;
    chatDefault = true;

    async createMessage(message: INewsMessage): Promise<INewsSendParams> { return { ...message }; };

    hasFilters = false;

    useFilter(object: INewsMessage, filter: IFilter) {
        return true;
    }
}