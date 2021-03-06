import Bot from "../Bot";
import { IStandaloneCommandArguments } from "../Commands/Arguments";
import StandaloneCommand from "../Commands/StandaloneCommand";
import Logger from "../Logger";
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
        if(!message.chatId) return;
        try {
            let { items } = await vk.api.messages.getConversationMembers({ peer_id: message.peerId });
            let user = items.find(m => m.member_id == message.sender);
            if(!user.is_admin) return;
            let wasDisabled = disabled.switch(message.peerId);
            message.reply(`Бот ${wasDisabled ? 'включен' : 'отключен'}`)
            Logger.info(`Bot ${wasDisabled ? 'enabled' : 'disabled'} in chat ${message.peerId}`);
        } catch {}
    }
}