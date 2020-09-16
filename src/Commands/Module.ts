import Command from "./Command";
import Message from "../Message";
import Bot from "../Bot";

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

    run(message: Message, bot: Bot) {
        if(!this.prefix.includes(message.prefix)) return;
        if(!this.isPermitted(message, bot)) return;

        if(message.command == "help"
            || message.command == "рудз") return this.help(message);

        let command = this.commands.find(c => c.command.includes(message.command));
        if(!command) return;
        
        let args = command.parseArguments(message, bot);
        command.use();
        command.run(args);
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