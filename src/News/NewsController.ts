import Bot from "../Bot";
import NewsRule from "./NewsRule";
import GroupRule from "./Rules/Group";
import OsuUpdateRule from "./Rules/OsuUpdate";

import fs from "fs";
import OsuNewsRule from "./Rules/OsuNews";
import Message from "../Message";
import NewRankedRule from "./Rules/NewRanked";
import { PrismaClient } from "@prisma/client";

interface IChatRule {
    enabled: boolean;
    filters: string[];
}

interface IChatRules {
    [key: string]: IChatRule;
}

interface IRuleCollection {
    id: number;
    rules: IChatRules
}
interface IRule {
    id?: number;
    peerId: number;
    type: string;
    enabled: boolean;
    filters: string;
}

export default class NewsController {
    rules: NewsRule<any>[];

    step: 25;

    constructor(
        private bot: Bot
    ) {
        this.rules = [
            new GroupRule(this, this.bot),
            new OsuUpdateRule(this, this.bot, this.bot.v2.data, 'osuupdate'),
            new OsuNewsRule(this, this.bot, this.bot.v2.data, 'osunews'),
            new NewRankedRule(this, this.bot, this.bot.v2.data, 'newranked')
        ];
    }

    private get db(): PrismaClient {
        return this.bot.database;
    }

    private async asyncFilter<T>(arr: T[], f: (value: T, index: number, array: T[]) => Promise<boolean>) {
        let values = await Promise.all(arr.map((value, index, array) => f(value, index, array)));

        return arr.filter((_, index) => values[index]);
    }

    async send<T>(r: NewsRule<T> | string, o: T) {
        let rule = typeof r == "string" 
            ? this.getNewsRule(r) : r;

        let ids = [
            ...this.getChats(),
            ...await this.getUsers()
        ];

        ids = ids.filter((id, i, a) => a.indexOf(id) == i);
        ids = await this.asyncFilter(ids, async (id) => this.getRule(id, rule.name).then(rr => rr.enabled));
        
        if(rule.hasFilters) {
            ids = await this.asyncFilter(ids, async (id) => {
                let filters = (await this.getRule(id, rule.name)).filters
                    .split(";;").map(f => NewsRule.parseFilters(f));
                if(!filters.length) return true;

                let res = false;
                for(let filter of filters)
                    res ||= filter.every(f => rule.useFilter(o, f));
                return res;
            });
        }

        let { message, attachment } = await rule.createMessage(o);

        while(ids.length > 0) {
            try {
                let code = ids
                    .splice(0, this.step)
                    .map(id =>
                        `API.messages.send(${JSON.stringify({ peer_id: id, message: Message.fixString(message), random_id: Math.ceil(Math.random() * (2 ** 20)), attachment: attachment ?? "", dont_parse_links: 1 })});`)
                    .join('\n') + "\nreturn true;";
                await this.bot.vk.api.execute({ code });
            } catch(e) {}
        }
    }

    private getChats() {
        let ids = [];
        for(let i = 1; i <= 280; i++) 
            ids.push(2000000000 + i);

        return ids;
    }

    private async getUsers(): Promise<number[]> {
        let rawIds: number[][] = (await this.bot.vk.api.execute({ code: `
            var i = 0;
            var users = [];
            while(i < 25) {
                var u = API.messages.getConversations({"count": 200, "offset": 200 * i}).items@.conversation@.peer@.id;
                users.push(u);
                i = i + 1;
                if(u.length < 200) {
                    i = 25;
                }
            }
            return users;
        `})).response;

        return rawIds.flat(1);
    }

    private getNewsRule(rule: string): NewsRule<any> {
        return this.rules.find(r => r.name == rule);
    }

    private async upsert(r: IRule, data: object): Promise<void> {
        if(r.id)
            await this.db.newsRules.update({
                where: { id: r.id }, data
            });
        else
            await this.db.newsRules.create({
                data: { ...r, ...data }
            });
    }

    async getRule(id: number, rule: string): Promise<IRule> {
        let r = this.getNewsRule(rule);
        let rules = await this.db.newsRules.findFirst({
            where: {
                peerId: id,
                type: rule
            }
        }) ?? { peerId: id, type: rule, enabled: r.getDefault(id), filters: "" };

        return rules;
    }

    async setRule(id: number, rule: string, enabled: boolean): Promise<boolean> {
        let r = await this.getRule(id, rule);
        await this.upsert(r, { enabled });
        return enabled;
    }

    async switchRule(id: number, rule: string): Promise<boolean> {
        let nr = this.getNewsRule(rule);
        let r = await this.getRule(id, rule);
        let value = r.id ? !r.enabled : !nr.getDefault(id);
        await this.upsert(r, { enabled: value });
        return value;
    }

    async addFilter(id: number, rule: string, filter: string): Promise<void> {
        let r = await this.getRule(id, rule);
        let filters = r.filters.split(";;");
        filters.push(filter);
        await this.upsert(r, { filters: filters.join(";;") });
    }

    async removeFilter(id: number, rule: string, i2: number): Promise<void> {
        let r = await this.getRule(id, rule);
        let filters = r.filters.split(";;");
        if(i2 < 0)
            throw "FUCK YOU";
        if(filters.length < i2)
            throw "ALSO FUCK YOU";
        filters.splice(i2 - 1, 1);
        await this.upsert(r, { filters: filters.join(";;") });
    }
}