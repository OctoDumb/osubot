import Bot from "../Bot";
import Module from "../Commands/Module";

export class ModulesManager {
    private static modules: Module[] = [];

    static add(module: Module) {
        this.modules.push(module);
    }

    static getInstances(bot: Bot) {
        return this.modules.map(m => {
            const module: any = <unknown>m;
            return new module(bot)
        });
    }
}

export function ModuleDecorator(constructor: Function) {
    ModulesManager.add(<Module><unknown>constructor);
}