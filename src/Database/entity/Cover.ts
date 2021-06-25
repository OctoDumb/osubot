import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import VK from "vk-io";
import Logger from "../../Logger";

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
            Logger.debug(`Requesting Cover ID ${id}`, "DB");
            try { 
                let photo = await vk.upload.messagePhoto({
                    source: {
                        value: `https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg?1`
                    }
                });
                await Cover.create({ id, attachment: photo.toString() }).save();
                Logger.debug(`Request for Cover ID ${id} succeeded`);
                return photo.toString();
            } catch(e) {
                Logger.warn(`Request for Cover ID ${id} failed`);
                await Cover.create({ id, attachment: "" }).save();
                return "";
            }
        } else return cover.attachment;
    }

}