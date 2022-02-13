import { JSDOM } from "jsdom";
import { IArgumentsWithMode, IServerCommandArguments } from "../../Commands/Arguments";
import ServerCommand from "../../Commands/Server/ServerCommand";
import PuppeteerInstance from "../../PuppeteerInstance";

export default class BanchoStatus extends ServerCommand {
    name = "Status";
    command = [ "status", "ыефегы" ];

    description = "Parse information about bancho status from https://status.ppy.sh/";

    async run({
        message, 
    }: IServerCommandArguments<IArgumentsWithMode>) {
        const html = await PuppeteerInstance.getHTMLPageContent("https://p.datadoghq.com/sb/irf3GA-9d3320518e0c2ab413cb8774f5562ce2");
        const DOM = new JSDOM(html);
        const { document } = DOM.window;

        const values = Array.from(document.querySelectorAll(".big_number")).map(v => {
            const text = v.childNodes[0] as Text;
            return text.data;
        });

        const [
            usersOnline, 
            roomsCount,
            plays, 
            playsNewHighScore, 
            chat, 
            scoreSubmission, 
            publicAPI, 
            openTickets
        ] = values;

        message.reply(`
            users online: ${usersOnline}
            current multiplayer rooms: ${roomsCount}
            plays: ${plays}/sec
            plays (new user high score): ${playsNewHighScore}/sec
            bancho (chat / mp): ${chat}%
            score submission: ${scoreSubmission}%
            public api: ${publicAPI}%
            open tickets: ${openTickets}
        `);
    }
}