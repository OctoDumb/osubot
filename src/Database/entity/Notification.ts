import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({
    name: "notifications"
})
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column()
    message: string;

    @Column({
        default: false
    })
    delivered: boolean;

}