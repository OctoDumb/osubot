import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "./Status";
import { User } from "./User";

@Entity({
    name: "statusesowned"
})
export class StatusOwned extends BaseEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Status)
    status: Status;

}