import fs from "fs";
import { addNotification } from "./Util";
import dateformat from "dateformat";
import VK from "vk-io";

dateformat.i18n = {
    monthNames: [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Нов', 'Дек',
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    dayNames: [],
    timeNames: []
}

interface IBan {
    id: number;
    reason?: string;
    until: number;
    notified: boolean;
}

export class BanUtil {
    public static isBanned(ban?: Ban): boolean {
        return ban?.until < Date.now() ?? false;
    }

    public static async addBan(vk: VK,id: number, duration: number, reason?: string) {
        let until = Date.now() + duration;
        return until;
    }
}

export default class Banlist {
    private static list: IBan[] = [];
    
    public static init(): void {
        if(fs.existsSync("./bans.json"))
            Banlist.list = JSON.parse(fs.readFileSync("./bans.json").toString());
    }

    public static getBanStatus(id: number): IBan | null {
        return Banlist.list.find(b => b.id == id);
    }

    public static isBanned(id: number): boolean {
        let ban = Banlist.list.find(b => b.id == id);
        if(!ban)
            return false;
        else {
            return !Banlist.clean(id);
        } 
    }

    private static clean(id: number): boolean {
        let i = Banlist.list.findIndex(b => b.id == id);
        if(Banlist.list[i].until > Date.now())
            return false;
        else {
            Banlist.list.splice(i, 1);
            Banlist.save();
            return true;
        }
    }

    public static addBan(id: number, duration: number, reason?: string): number {
        let ban = { id, reason: reason ? reason : "не указана", until: Date.now() + duration, notified: false };
        if(Banlist.isBanned(id)) {
            let i = Banlist.list.findIndex(b => b.id == id);
            Banlist.list[i] = ban;
        } else 
            Banlist.list.push(ban);
            
        Banlist.save();
        return Date.now() + duration;
    }

    public static removeBan(id: number): boolean {
        let i = Banlist.list.findIndex(b => b.id == id);
        if(i >= 0) Banlist.list.splice(i, 1);
        Banlist.save()
        return i >= 0;
    }

    public static setNotified(id: number): void {
        let i = Banlist.list.findIndex(b => b.id == id);
        if(i >= 0) Banlist.list[i].notified = true;
        Banlist.save();
    }

    private static save(): void {
        fs.writeFileSync("./bans.json", JSON.stringify(Banlist.list));
    }
}