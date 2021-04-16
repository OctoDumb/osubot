import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { VK } from "vk-io";
import { addNotification } from "../../Util";
import dateformat from "dateformat";
import { User } from "./User";

dateformat.i18n = {
    monthNames: [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Нов', 'Дек',
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    dayNames: [],
    timeNames: []
}

@Entity({
    name: "bans"
})
export class Ban extends BaseEntity {
    
    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column()
    until: number;

    @Column({
        nullable: true
    })
    reason?: string;

    get isBanned() {
        return this.until < Date.now();
    }

    static async add(vk: VK, id: number, duration: number, reason?: string): Promise<number> {
        let until = Date.now() + duration;
        await Ban.delete({ user: { id } });
        await Ban.create({ user: await User.findOne(id), until, reason }).save();
        await addNotification(vk, id, `
            Вы были забанены!
            Время окончания бана: ${dateformat(new Date(until), "dd mmm yyyy HH:MM:ss 'MSK'")}
            Причина бана: ${reason ?? "не указана"}
        `);
        return until;
    }
}