import Logger from "./Logger";

export default class Disabled {
    list: number[] = [];

    switch(id: number) {
        let isDisabled = this.isDisabled(id);
        if(isDisabled)
            this.list = this.list.filter(i => i != id);
        else
            this.list.push(id);

        Logger.info(`${isDisabled ? "Enabled" : "Disabled"} bot in chat ${id}`, "BOT")

        return isDisabled;
    }

    isDisabled(id: number) {
        return this.list.includes(id);
    }
}