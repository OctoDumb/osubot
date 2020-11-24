import { MessagesConversationMember } from "vk-io";
import ICommandArguments from "../../../Commands/Arguments";
import Command from "../../../Commands/Command";

export default class MainNews extends Command {
    name = "News";
    command = ["news"];

    delay = 0;

    description = "Настройки рассылки";

    async run({ message, news, vk }: ICommandArguments) {
        const { sender, peerId, arguments: args, chatId } = message;

        if(chatId) {
            let chat: MessagesConversationMember[];
            try {
                chat = (await vk.api.messages.getConversationMembers({ peer_id: peerId })).items;
            } catch(e) {
                throw 'Мне нужны права администратора, чтобы проверить, являетесь ли вы администратором беседы!';
            }

            let user = chat.find(m => m.member_id == sender);
            
            if(!user.is_admin)
                throw "Вы не можете управлять рассылкой!";
            
            if(!args[0])
                throw `Укажите тип рассылки (${news.rules.map(rule => rule.name).join('/')})`;

            let name = args.shift().toLowerCase();

            let rule = news.rules.find(rule => rule.name == name);

            if(!rule)
                throw 'Неизвестный тип рассылки!';

            let reply = rule.processCommand(peerId, args);

            if(reply) message.reply(reply);
        } else {
            if(!args[0])
                throw `Укажите тип рассылки (${news.rules.map(rule => rule.name).join('/')})`;

            let name = args.shift().toLowerCase();

            let rule = news.rules.find(rule => rule.name == name);

            if(!rule)
                throw 'Неизвестный тип рассылки!';

            let reply = rule.processCommand(peerId, args);

            if(reply) message.reply(reply);
        }
    }
}