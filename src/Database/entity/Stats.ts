import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUserAPIResponse } from "../../API/Osu/APIResponse";

@Entity({
    name: "stats"
})
export class Stats extends BaseEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    server: string;

    @Column()
    playerId: number;

    @Column()
    mode: number;

    @Column({
        default: 9999999
    })
    rank: number;

    @Column({
        default: 0,
        type: "float"
    })
    pp: number;

    @Column({
        default: 100,
        type: "float"
    })
    accuracy: number;

    static async updateInfo(server: string, user: IUserAPIResponse, mode: number = 0) {
        let i = await Stats.findOne({ where: { playerId: user.id, server } });

        if(!i)
            await Stats.create({ 
                playerId: user.id, mode, server,
                rank: user.rank.total, pp: user.pp, 
                accuracy: user.accuracy 
            }).save();
        else
            await Stats.update({ 
                playerId: user.id, mode, server 
            }, {
                rank: user.rank.total, pp: user.pp,
                accuracy: user.accuracy
            });
    }

}