import Bot from "../Bot";
import { IStandaloneCommandArguments } from "../Commands/Arguments";
import StandaloneCommand from "../Commands/StandaloneCommand";
import Message from "../Message";
import { defaultArguments } from "../Util";

export default class DisableBotCommand extends StandaloneCommand {
    name = "DisableBot";
    command = [ "disablebot" ];

    description = "";

    disables = false;
    
    parseArguments(message: Message, bot: Bot) {
        return {
            ...defaultArguments(message, bot)
        };
    }

    async run({ message, disabled, vk }: IStandaloneCommandArguments<null>) {
        if(!message.chatId)
        try {
            let { items } = await vk.api.messages.getConversationMembers({ peer_id: message.peerId });
            let user = items.find(m => m.member_id == message.sender);
            if(!user.is_admin) return;
            let isDisabled = disabled.includes(message.peerId);
            if(isDisabled)
                disabled = disabled.filter(d => d != message.peerId);
            else
                disabled.push(message.peerId);
            message.reply(`Бот ${isDisabled ? 'включен' : 'отключен'}`)
        } catch {}
    }
}