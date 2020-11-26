import Command from "./Command";
import Message from "../Message";
import Bot from "../Bot";
import Banlist from "../Banlist";
import dateformat from "dateformat";

dateformat.i18n = {
    monthNames: [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Нов', 'Дек',
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
}

export default abstract class Module {
    abstract name: string;
    abstract prefix: string[];

    abstract description: string;

    abstract commands: Command[];
    
    constructor(
        private bot: Bot,
    ) {}

    protected get database() { return this.bot.database; }
    protected get apilist() { return this.bot.api; }

    async run(message: Message, bot: Bot) {
        if(!this.prefix.includes(message.prefix)) return;
        if(!this.isPermitted(message, bot)) return;

        if(message.command == "help"
            || message.command == "рудз") return this.help(message);

        let command = this.commands.find(c => c.command.includes(message.command));
        if(!command) return;

        let ban = Banlist.getBanStatus(message.sender);
        if(Banlist.isBanned(message.sender)) {
            if(!ban.notified) {
                message.reply(`
                    Вы были забанены!
                    Время окончания бана: ${dateformat(new Date(ban.until), "dd mmm yyyy HH:MM:ss 'MSK'")}
                    Причина бана: ${ban.reason ?? "не указана"}
                `);
                Banlist.setNotified(message.sender);
            }

            if(!command.ignoreBan) return;
        }
        
        try {
            command.use(message);
            
            let args = command.parseArguments(message, bot);
            await command.run(args);
        } catch(e) {
            message.reply(`Ошибка! ${e instanceof Error ? e.message : e}`);
        }
    }

    help(message: Message) {
        message.reply(`
            Категория: ${this.name} - ${this.description}
            Префиксы: ${this.prefix.join(', ')}

            ${this.commands.map(c => `${c.name} - (${c.command.join(', ')}) - ${c.description}`).join('\n')}
        `);
    }

    isPermitted(message: Message, bot: Bot) {
        return true;
    }
}