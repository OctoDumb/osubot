import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "roles"
})
export class Role extends BaseEntity {
    
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    name: string;

    @Column({
        default: ""
    })
    permissions: string;

}