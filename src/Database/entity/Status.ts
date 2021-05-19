import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ServerConnection } from "./ServerConnection";

@Entity({
    name: "statuses"
})
export class Status extends BaseEntity {
    
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column()
    emoji: string;

    @Column()
    description: string;

    static async getByPlayerId(playerId: number): Promise<Status> {
        let connections = await ServerConnection.find({
            where: { playerId },
            relations: [ 'user', 'user.status' ]
        });
        
        if(!connections.length) return null;
        return connections[0].user.status;
    }

}