export enum Permission {
    IGNOREBAN = "ignoreban",
    BAN = "ban",
    ADMIN = "admin",
    ALL = "*"
}

export default class PermissionManager {

    static hasPermission(ps: string | string[], p: Permission): boolean {
        if(typeof ps == "string")
            ps = ps.split(",");

        return ps.includes(Permission.ALL) || ps.includes(p);
    }
}