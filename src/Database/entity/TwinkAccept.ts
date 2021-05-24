import { BaseEntity, Column, DeepPartial, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "twinkaccept"
})
export class TwinkAccept extends BaseEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column()
    server: string;

}