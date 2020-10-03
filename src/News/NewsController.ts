import Bot from "../Bot";
import NewsRule from "./NewsRule";
import GroupRule from "./Rules/Group";
import OsuUpdateRule from "./Rules/OsuUpdate";

import fs from "fs";
import OsuNewsRule from "./Rules/OsuNews";
import Message from "../Message";
import NewRankedRule from "./Rules/NewRanked";

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

export default class NewsController {
    rules: NewsRule<any>[];

    settings: IRuleCollection[];

    step = 25;

    constructor(
        private bot: Bot
    ) {
        this.rules = [
            new GroupRule(this, this.bot),
            new OsuUpdateRule(this, this.bot, this.bot.v2.data, 'osuupdate'),
            new OsuNewsRule(this, this.bot, this.bot.v2.data, 'osunews'),
            new NewRankedRule(this, this.bot, this.bot.v2.data, 'newranked')
        ];

        this.settings = fs.existsSync("./news_rules.json") 
            ? JSON.parse(fs.readFileSync("./news_rules.json").toString()) 
            : [];

        setInterval(() => this.save(), 5000);
    }

    save() {
        fs.writeFileSync("./news_rules.json", JSON.stringify(this.settings));
    }

    async send(r: NewsRule<any> | string, object: any) {
        let rule = typeof r == "string"
            ? this.rules.find(rl => rl.name == r)
            : r;
        
        let ids = [
            ...this.getChats(),
            ...await this.getUsers()
        ];

        ids = ids.filter(id => this.getRule(id, rule.name).enabled);

        console.log(ids);

        if(rule.hasFilters) {
            ids = ids.filter(id => {
                let filters = this.getRule(id, rule.name).filters.map(f => NewsRule.parseFilters(f));
                if(!filters.length) return true;

                let r = false;
                for(let filter of filters)
                    r ||= filter.every(f => rule.useFilter(object, f));

                return r;
            });
        }

        let { message, attachment } = await rule.createMessage(object);

        while(ids.length > 0) {
            try {
                let code = ids
                    .splice(0, this.step)
                    .map(id =>
                        `API.messages.send(${JSON.stringify({ peer_id: id, message: Message.fixString(message), random_id: Math.ceil(Math.random() * (2 ** 20)), attachment: attachment ?? "", dont_parse_links: 1 })});`)
                    .join('\n');
                await this.bot.vk.api.execute({ code });
            } catch(e) {}
        }
        
        console.log("Done!");
    }

    private getChats() {
        let ids = [];
        for(let i = 1; i <= 280; i++) 
            ids.push(2000000000 + i);

        return ids;
    }

    private async getUsers() {
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

        return <Array<number>>rawIds.flat(1);
    }

    isChat(id: number): boolean {
        return id > 200000000;
    }

    getRules(id: number): IChatRules {
        let rules = this.settings.find(s => s.id == id)?.rules ?? {};

        let df = {};

        for(let rule of this.rules)
            df[rule.name] = {
                enabled: this.isChat(id) ? rule.chatDefault : rule.userDefault,
                filters: []
            };

        return Object.assign(df, rules);
    }

    getRule(id: number, type: string): IChatRule {
        let rules = this.getRules(id);

        return rules[type];
    }

    setRule(id: number, type: string, rule: boolean): void {
        let i = this.settings.findIndex(s => s.id == id);
        let rules = this.getRules(id);
        rules[type].enabled = rule;
        if(i == -1)
            this.settings.push({ id, rules });
        else {
            this.settings[i].rules = rules;
        }
    }

    switchRule(id: number, type: string): boolean {
        let rule = this.getRule(id, type);

        let r = !rule.enabled;

        this.setRule(id, type, r);

        return r;
    }

    addFilter(id: number, type: string, filter: string): void {
        let i = this.settings.findIndex(s => s.id == id);

        this.settings[i].rules[type].filters.push(filter);
    }

    removeFilter(id: number, type: string, i2: number): void {
        let i = this.settings.findIndex(s => s.id == id);

        this.settings[i].rules[type].filters.splice(i2, 1);
    }
}