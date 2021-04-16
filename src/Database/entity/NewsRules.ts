import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "newsrules"
})
export class NewsRules extends BaseEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    peerId: number;

    @Column()
    type: string;

    @Column()
    enabled: boolean;

    @Column({
        type: "text",
        transformer: {
            to(f: string[]) {
                return f.join(";;");
            },
            from(s: string) {
                return s.split(";;");
            }
        }
    })
    filters: string[];

}