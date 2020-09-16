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

    hasFilters = true;

    useFilter(object: INewsMessage, filter: IFilter) {
        if(filter.name == "contains")
            return object.message.includes(filter.value.toLowerCase());
    }
}