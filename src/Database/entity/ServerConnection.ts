import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({
    name: "connections"
})
export class ServerConnection extends BaseEntity {
    
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    server: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    playerId: number;

    @Column()
    nickname: string;

    @Column({
        default: 0
    })
    mode: number;
}