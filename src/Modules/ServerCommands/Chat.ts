import { PrismaClient, Stats, Status } from "@prisma/client";
import Bot from "../../Bot";
import { IArgumentsWithMode, IServerCommandArguments, parseArguments, Parsers } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import Message from "../../Message";
import PrivilegesManager from "../../Privileges";
import { ChatTopTemplate } from "../../Templates";
import { defaultArguments, getStatus, getUserInfo } from "../../Util";

export interface IChatTopUser {
    status: Status;
    nickname: string;
    stats: Stats;
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
        database,
        privileges
    }: IServerCommandArguments<IArgumentsWithMode>) {
        let { mode } = await getUserInfo(message, this.module.name, database, clean, args);
        let chatId = message.chatId ?? Number(clean);
        if(!chatId || chatId < 1)
            throw "Некорректный ID";

        let members = (await vk.api.messages.getConversationMembers({
            peer_id: 2e9 + chatId
        })).profiles?.map(m => m.id);

        let users = await Promise.all(members?.map(id => this.getChatTopUser(database, privileges, id, mode)));

        let msg = ChatTopTemplate(
            this.module, chatId, 
            users
                .filter(u => !!u.stats.id)
                .filter((u, i, a) => a.findIndex(uu => uu.stats.playerId == u.stats.playerId) == i)
        );

        message.reply(msg);
    }

    private async getChatTopUser(database: PrismaClient, privileges: PrivilegesManager, id: number, mode: number): Promise<IChatTopUser> {
        let conn = await database.serverConnection.findFirst({
            where: {
                userId: id
            }
        });
        if(!conn)
            return null;
        return {
            status: await getStatus(database, conn.playerId),
            nickname: conn.nickname,
            stats: await database.stats.findFirst({
                where: {
                    playerId: conn.playerId
                }
            })
        };
    }
}