import EventEmitter from "eventemitter3";
import Bot from "../Bot";
import NewsController from "./NewsController";

export interface INewsSendParams {
    message: string;
    attachment?: string;
}

export interface IFilter {
    name: string;
    operator: string;
    value: string;
}

export function executeFilter(v: number, filter: IFilter) {
    return eval(`${v}${filter.operator}${filter.value}`);
}

export default abstract class NewsRule<T> {
    abstract name: string;

    abstract userDefault: boolean;
    abstract chatDefault: boolean;

    public getDefault(id: number): boolean {
        return id > 2000000000 ? this.chatDefault : this.userDefault;
    }

    public abstract createMessage(obj: T): Promise<INewsSendParams>;

    async processCommand(id: number, args: string[]): Promise<string | null> {
        let command = args.shift();
        if(!command) return "Недостаточно аргументов";
        switch(command.toLowerCase()) {
            case "switch":
                let newValue = await this.controller.switchRule(id, this.name);
                return `Рассылка ${this.name} ${newValue ? "в" : "от"}ключена`;

            case "enable":
                await this.controller.setRule(id, this.name, true);
                return `Рассылка ${this.name} включена`;

            case "disable":
                await this.controller.setRule(id, this.name, false);
                return `Рассылка ${this.name} отключена`;

            case "filters":
                if(!this.hasFilters) return "У этой рассылки нет фильтров!";
                if(!args[0]) return "Недостаточно аргументов";
                
                switch(args[0].toLowerCase()) {
                    case "list":
                        let { filters } = await this.controller.getRule(id, this.name);
                        if(filters.length)
                            return `Фильтры:\n${filters.replace(/;;/g, '\n')}`;
                        return `Нет фильтров`;

                    case "add":
                    case   "+":
                        await this.controller.addFilter(id, this.name, args.slice(1).join(" "))
                        return "Фильтр добавлен!";

                    case "remove":
                    case    "del":
                    case "delete":
                    case      "-":
                        this.controller.removeFilter(id, this.name, Number(args[1]) - 1);
                        return "Фильтр удалён!";
                }

                break;
            
            default:
                return null;
        }
    }
    
    public abstract hasFilters: boolean = false;

    public abstract useFilter?(object: T, filter: IFilter): boolean;

    constructor(
        protected controller: NewsController,
        protected bot: Bot,
        emitter?: EventEmitter,
        event?: string
    ) {
        if(event)
            emitter.on(
                event, 
                (o: T) => this.controller.send(this, o)
            );
    }

    static parseFilters(filter: string): IFilter[] {
        let r = /(?<name>\w+)(?<operator>(=|>|<|>=|<=))(?<value>(\".+\"|\S+))/g;
        let filters: IFilter[] = [];
        let m;
        while((m = r.exec(filter)) !== null) {
            if(m.index === r.lastIndex)
                r.lastIndex++;

            filters.push(<IFilter>m.groups);
        }

        return filters;
    }
}