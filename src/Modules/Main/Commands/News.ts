import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainNews extends Command {
    name = "News";
    command = ["news"];

    description = "Настройки рассылки";

    async run({ message, news, vk }: ICommandArguments) {
        const { sender, peerId, arguments: args, chatId } = message;

        if(chatId) {
            try {
                let chat = (await vk.api.messages.getConversationMembers({ peer_id: peerId })).items;

                let user = chat.find(m => m.member_id == sender);
                
                if(!user.is_admin)
                    return message.reply("Вы не можете управлять рассылкой!");
                
                if(!args[0])
                    return message.reply(`Укажите тип рассылки (${news.rules.map(rule => rule.name).join('/')})`);

                let rule = news.rules.find(rule => rule.name == args.shift().toLowerCase());

                if(!rule)
                    return message.reply('Неизвестный тип рассылки!');

                let reply = rule.processCommand(peerId, args);

                if(reply) message.reply(reply);
            } catch(e) {
                console.log(e);
                message.reply('Мне нужны права администратора, чтобы проверить, являетесь ли вы администратором беседы!');
            }
        } else {
            if(!args[0])
                return message.reply(`Укажите тип рассылки (${news.rules.map(rule => rule.name).join('/')})`);

            let rule = news.rules.find(rule => rule.name == args.shift().toLowerCase());

            if(!rule)
                return message.reply('Неизвестный тип рассылки!');

            let reply = rule.processCommand(peerId, args);

            if(reply) message.reply(reply);
        }
    }
}