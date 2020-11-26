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

    public abstract createMessage(obj: T): Promise<INewsSendParams>;

    processCommand(id: number, args: string[]): string | null {
        let command = args.shift();
        if(!command) return "Недостаточно аргументов";
        switch(command.toLowerCase()) {
            case "switch":
                let newValue = this.controller.switchRule(id, this.name);
                return `Рассылка ${this.name} ${newValue ? "в" : "от"}ключена`;

            case "enable":
                this.controller.setRule(id, this.name, true);
                return `Рассылка ${this.name} включена`;

            case "disable":
                this.controller.setRule(id, this.name, false);
                return `Рассылка ${this.name} отключена`;

            case "filters":
                if(!this.hasFilters) return "У этой рассылки нет фильтров!";
                if(!args[0]) return "Недостаточно аргументов";
                
                switch(args[0].toLowerCase()) {
                    case "list":
                        let { filters } = this.controller.getRule(id, this.name);
                        if(filters.length)
                            return `Фильтры:\n${filters.join("\n")}`;
                        return `Нет фильтров`;

                    case "add":
                    case   "+":
                        this.controller.addFilter(id, this.name, args.slice(1).join(" "))
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