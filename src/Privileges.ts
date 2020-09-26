import fs from "fs";
import { IDBUser } from "./Database";

export type PrivilegesType = "None" | "Donater" | "CoolDonater" | "Verified" | "Moderator" | "Owner";

const StatusSets = {
    Donater: [
        "❤"
    ],
    CoolDonater: [
        "💖"
    ],
    Verified: [
        "✅"
    ],
    Moderator: [
        "👁"
    ],
    Owner: [
        "👑"
    ]
};

export const Hierarchy: PrivilegesType[] = [
    "Donater",
    "CoolDonater",
    "Verified",
    "Moderator",
    "Owner"
];

export interface IPrivileges {
    id: number;
    privileges: PrivilegesType[];
    status: string | null;
}

export default class PrivilegesManager {
    private list: IPrivileges[];
    constructor(file: string = "./privileges.json") {
        this.list = fs.existsSync(file) 
            ? JSON.parse(fs.readFileSync(file).toString())
            : [];

        setInterval(() => {
            fs.writeFileSync(file, JSON.stringify(this.list));
        }, 2000);
    }

    getSetForPrivilege(priv: PrivilegesType): string[] {
        switch(priv) {
            case "Donater":
                return StatusSets.Donater;
            case "CoolDonater":
                return [
                    ...StatusSets.Donater,
                    ...StatusSets.CoolDonater
                ];
            case "Verified":
                return StatusSets.Verified;
            case "Moderator":
                return StatusSets.Moderator;
            case "Owner":
                return [
                    ...StatusSets.Donater,
                    ...StatusSets.CoolDonater,
                    ...StatusSets.Moderator,
                    ...StatusSets.Owner
                ];
            default:
                return [];
        }
    }

    getAvailableStatuses(priv: PrivilegesType[]): string[] {
        return priv.flatMap(p => this.getSetForPrivilege(p)).filter((s, i, a) => a.lastIndexOf(s) == i);
    }

    getDefaultStatus(priv: PrivilegesType): string {
        switch(priv) {
            case "None":
                return "";
            case "Donater":
                return StatusSets.Donater[0];
            case "CoolDonater":
                return StatusSets.CoolDonater[0];
            case "Verified":
                return StatusSets.Verified[0];
            case "Moderator":
                return StatusSets.Moderator[0];
            case "Owner":
                return StatusSets.Owner[0];
        }
    }

    sortPrivileges(priv: PrivilegesType[]): PrivilegesType[] {
        return priv.sort((a, b) => Hierarchy.indexOf(a) - Hierarchy.indexOf(b))
    }

    getHighestPrivilege(priv: PrivilegesType[]): PrivilegesType {
        return this.sortPrivileges(priv).pop() ?? "None";
    }

    getPrivileges(id: number): PrivilegesType[] {
        return this.sortPrivileges(this.list.find(p => p.id == id)?.privileges ?? []);
    }

    hasPrivilege(id: number, priv: PrivilegesType): boolean {
        return this.list.find(p => p.id == id)?.privileges.includes(priv) ?? false;
    }

    getStatus(id: number): string {
        return this.list.find(p => p.id == id)?.status ?? "";
    }

    isHigher(priv1: PrivilegesType, priv2: PrivilegesType) {
        return Hierarchy.indexOf(priv1) > Hierarchy.indexOf(priv2);
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

    addPrivilege(id: number, priv: PrivilegesType) {
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
            throw new Error("This user already has thie privilege");
    }

    removePrivilege(id: number, priv: PrivilegesType) {
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