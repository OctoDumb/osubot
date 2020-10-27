import fs from "fs";
import { IDBUser } from "../Database";
import Types from "./types.json";

interface PrivilegesType {
    name: string;
    description: string;
    inherits?: string[];
    statuses: string[]
}

class TypesCollection {
    types: PrivilegesType[] = Types;

    getType(priv: string): PrivilegesType {
        return this.types.find(t => t.name == priv);
    }

    getSetFor(priv: string): string[] {
        let type = this.getType(priv);
        if(!type) return [];

        let statuses = [
            ...type.statuses
        ];

        if(type.inherits)
            statuses.unshift(
                ...type.inherits.flatMap(t => 
                    this.getType(t).statuses
                )
            );

        return statuses;
    }

    indexOf(priv: string): number {
        return this.types.findIndex(t => t.name == priv);
    }
}

export interface IPrivileges {
    id: number;
    privileges: string[];
    status: string | null;
}

export default class PrivilegesManager {
    private list: IPrivileges[];

    private types = new TypesCollection();

    constructor(file: string = "./privileges.json") {
        this.list = fs.existsSync(file) 
            ? JSON.parse(fs.readFileSync(file).toString())
            : [];

        setInterval(() => {
            fs.writeFileSync(file, JSON.stringify(this.list));
        }, 2000);
    }

    getAvailableStatuses(priv: string[]): string[] {
        return priv.flatMap(p => this.types.getSetFor(p)).filter((s, i, a) => a.lastIndexOf(s) == i);
    }

    getDefaultStatus(priv: string): string {
        return this.types.getType(priv).statuses[0] ?? "";
    }

    sortPrivileges(priv: string[]): string[] {
        return priv.sort((a, b) => this.types.indexOf(a) - this.types.indexOf(b))
    }

    getHighestPrivilege(priv: string[]): string {
        return this.sortPrivileges(priv).pop() ?? "None";
    }

    getPrivileges(id: number): string[] {
        return this.sortPrivileges(this.list.find(p => p.id == id)?.privileges ?? []);
    }

    hasPrivilege(id: number, priv: string): boolean {
        return this.list.find(p => p.id == id)?.privileges.includes(priv) ?? false;
    }

    getStatus(id: number): string {
        return this.list.find(p => p.id == id)?.status ?? "";
    }

    isHigher(priv1: string, priv2: string) {
        return this.types.indexOf(priv1) > this.types.indexOf(priv2);
    }

    getUserStatus(users: IDBUser[]): string {
        let highestPriv = users.map(u => this.getHighestPrivilege(this.getPrivileges(u.id)));
        let i = 0;
        highestPriv.forEach((p, ii) => {
            if(this.isHigher(p, highestPriv[i])) i = ii;
        });

        return this.getStatus(users[i].id);
    }

    setStatus(id: number, status: string) {
        let i = this.list.findIndex(p => p.id == id);
        if(i < 0) throw new Error("No privileges");
        let p = this.list[i];

        if(!this.getAvailableStatuses(p.privileges).includes(status))
            throw new Error("Not enought privileges");

        this.list[i].status = status;
    }

    addPrivilege(id: number, priv: string) {
        let i = this.list.findIndex(p => p.id == id);
        if(i < 0 && priv == "None")
            throw new Error("This user doesn't have any privileges");
        if(priv == "None")
            this.list.splice(i, 1);
        else if(i < 0) {
            this.list.push({
                id,
                status: "",
                privileges: [ priv ]
            });
        } else if(!this.list[i].privileges.includes(priv)) {
            this.list[i].privileges.push(priv);
        } else
            throw new Error("This user already has this privilege");
    }

    removePrivilege(id: number, priv: string) {
        let i = this.list.findIndex(p => p.id == id);
        if(i < 0 || priv == "None")
            throw new Error("You can't remove None privileges");
        else if(this.list[i].privileges.includes(priv)) {
            let ii = this.list[i].privileges.indexOf(priv);
            this.list[i].privileges.splice(ii, 1);
            if(
                !this
                    .getAvailableStatuses(this.list[i].privileges)
                    .includes(this.list[i].status)
            )
                this.list[i].status = this.getDefaultStatus(priv);
        } else
            throw new Error("This user doesn't have this privilege");
    }
}