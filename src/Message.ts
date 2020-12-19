import { Role, User } from "@prisma/client";
import { MessageContext, MessagesSendParams } from "vk-io";
import MessageForward from "vk-io/lib/structures/shared/message-forward";
import MessageReply from "vk-io/lib/structures/shared/message-reply";

export default class Message {
    static DefaultParams: MessagesSendParams = {
        dont_parse_links: true,
        disable_mentions: true
    };

    clean: string;
    prefix: string;
    command: string;

    arguments: string[];

    get sender(): number {
        return this.ctx.senderId;
    }

    get forwarded(): MessageForward | MessageReply | undefined {
        return this.ctx.replyMessage ?? this.ctx.forwards[0] ?? undefined;
    }

    get peerId(): number {
        return this.ctx.peerId;
    }

    get chatId(): number | undefined {
        return this.ctx.chatId;
    };

    constructor(
        private ctx: MessageContext,
        public user: User & { role: Role }
    ) {
        let args = ctx.text?.split(" ") ?? [];

        this.clean = ctx.text;
        this.prefix = args.shift()?.toLowerCase();
        this.command = args.shift()?.toLowerCase();

        this.arguments = args;
    }

    async reply(message: string | MessagesSendParams, params: MessagesSendParams = {}) {
        if(typeof message == "string")
            await this.ctx.send(Message.fixString(message), { ...Message.DefaultParams, ...params });

        else
            await this.ctx.send({ 
                ...Message.DefaultParams, 
                ...message, 
                message: Message.fixString(message.message) 
            });
    }

    static fixString(str?: string): string {
        return str?.split("\n").map(s => s.replace(/\t/g, '').trim()).join("\n");
    }
}