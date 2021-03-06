import Message from "../../Message";
import ServerCommand from "../../Commands/Server/ServerCommand";
import { IServerCommandArguments, parseArguments, Parsers, IArgumentsWithMods } from "../../Commands/Arguments";
import Bot from "../../Bot";
import { defaultArguments, modsToString } from "../../Util";
import { LeaderboardTemplate } from "../../Templates";
import { ServerConnection } from "../../Database/entity/ServerConnection";
import { User } from "../../Database/entity/User";
import { OsuAPIWithScores } from "../../API/Osu/OsuServerAPI";
import { IScoreAPIResponse } from "../../API/Osu/APIResponse";
import ChatExclusiveError from "../../Errors/ChatExclusive";

export interface ILeaderboardEntry {
    user: ServerConnection;
    status: string;
    score: IScoreAPIResponse;
    pp?: number;
}

export default class LeaderboardCommand extends ServerCommand<OsuAPIWithScores> {
    name = "Leaderboard";
    command = [ "leaderboard", "lb", "дуфвукищфкв", "ди" ];

    description = "";

    parseArguments(message: Message, bot: Bot): IServerCommandArguments<IArgumentsWithMods> {
        return {
            ...defaultArguments(message, bot),
            ...parseArguments(message.arguments, [
                Parsers.mods
            ])
        }
    }

    async run({
        message, args,
        mapAPI, chats,
        vk, privileges,
        database
    }: IServerCommandArguments<IArgumentsWithMods>) {
        if(!message.chatId)
            throw new ChatExclusiveError("Команду можно использовать только в беседах!");

        let mapId = chats.getChatMap(message.peerId);
        let map = await mapAPI.getBeatmap(mapId);

        let { profiles } = await vk.api.messages.getConversationMembers({
            peer_id: message.peerId
        });

        let users: ServerConnection[] = [];
        for(let profile of profiles) {
            let user = await User.findOrCreate(profile.id);
            let conn = await ServerConnection.findOne({
                where: { user }
            });
            if(conn && !users.some(u => u.id == conn.id))
                users.push(conn);
        }

        let leaderboard = await this.api.getLeaderboard({
            beatmapId: mapId,
            users,
            mods: args.mods ?? 0
        });

        let scores = leaderboard.map(v => ({
            user: v.user,
            status: privileges.getStatus(v.user.id),
            score: args.mods ? v.scores.find(s => s.mods == args.mods) : v.scores.sort((a,b) => b.score - a.score)[0],
            pp: 0
        })).filter(v => v.score).sort((a,b) => b.score.score - a.score.score);
        
        for(let i = 0; i < scores.length; i++) {
            let s = scores[i].score;
            let pp = await mapAPI.getPP(mapId, {
                acc: s.accuracy * 100,
                combo: s.maxCombo,
                miss: s.counts.miss,
                mods: modsToString(s.mods).join(),
                n50: s.counts[50],
                score: s.score
            });
            scores[i].pp = pp.pp;
        }

        let msg = LeaderboardTemplate(this.module, scores, map);

        message.reply(msg);
    }
}