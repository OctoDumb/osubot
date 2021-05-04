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
        type: 'text',
        default: [],
        transformer: {
            to(p: string[]) {
                return p?.join(",") ?? "";
            },
            from(s: string) {
                return s?.split(',') ?? [];
            }
        }
    })
    permissions: string[];

}