import Bot from "../../Bot";
import { IArgumentsWithMode, IServerCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IDBUserStats } from "../../Database";
import Message from "../../Message";
import PrivilegesManager from "../../Privileges";
import { ChatTopTemplate } from "../../Templates";
import { defaultArguments, getUserInfo } from "../../Util";

export interface IChatTopUser {
    status: string;
    stats: IDBUserStats;
}

export default class ChatCommand extends ServerCommand {
    name = "Chat";
    command = [ "chat", "срфе" ];

    description = "";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IArgumentsWithMode> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [
                Parsers.mode
            ])
        }
    }

    async run({
        message, args,
        clean, vk,
        privileges
    }: IServerCommandArguments<IArgumentsWithMode>) {
        let { mode } = await getUserInfo(message, this.database, clean, args);
        let chatId = message.chatId ?? Number(clean);
        if(!chatId || chatId < 1)
            throw "Некорректный ID";

        let members = (await vk.api.messages.getConversationMembers({
            peer_id: 2e9 + chatId
        })).profiles?.map(m => m.id);

        let users = await Promise.all(members?.map(id => this.getChatTopUser(privileges, id, mode)));

        let msg = ChatTopTemplate(this.module, chatId, users.filter(u => !!u.stats.id));

        message.reply(msg);
    }

    private async getChatTopUser(privileges: PrivilegesManager, id: number, mode: number): Promise<IChatTopUser> {
        return {
            status: privileges.getStatus(id),
            stats: await this.database.getUserStats(id, mode)
        };
    }
}