import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import Config from "../../Config";
import { Role } from "./Role";
import { Status } from "./Status";

@Entity({
    name: "users"
})
export class User extends BaseEntity {
    
    @PrimaryColumn()
    id: number;

    @ManyToOne(() => Role)
    role: Role;

    @ManyToOne(() => Status)
    status: Status;

    static async findOrCreate(id: number): Promise<User> {
        let user = await User.findOne({ where: { id }, relations: [ 'role' ] });
        if(!user) {
            user = new User();
            user.id = id;
            user.role = await Role.findOne(Config.data.vk.ownerId == id ? 2 : 1);
        }
        return user;
    }

}