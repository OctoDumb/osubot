import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import VK from "vk-io";

@Entity({
    name: "covers"
})
export class Cover extends BaseEntity {

    @PrimaryColumn()
    id: number;

    @Column()
    attachment: string;

    static async get(vk: VK, id: number): Promise<string> {
        let cover = await Cover.findOne({ where: { id } });

        if(!cover) {
            try { 
                let photo = await vk.upload.messagePhoto({
                    source: {
                        value: `https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg?1`
                    }
                });
                await Cover.create({ id, attachment: photo.toString() }).save();
                return photo.toString();
            } catch(e) {
                await Cover.create({ id, attachment: "" }).save();
                return "";
            }
        } else return cover.attachment;
    }

}