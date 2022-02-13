import VK from "vk-io";
import CardGenerator from "../../Cards/CardGenerator";
import CardsManager from "../../Cards/CardsManager";
import Message from "../../Message";
import PuppeteerInstance from "../../PuppeteerInstance";
import ServerCommand from "./ServerCommand";

export interface ISendCardArguments {
    vk: VK;
    message: Message;
    obj: any;
}

export default abstract class ServerCommandWithCard<T> extends ServerCommand<T> {
    protected async sendCard<G extends CardGenerator<any>>(Gen: new () => G, { vk, message, obj }: ISendCardArguments): Promise<void> {
        let generator = CardsManager.getGenerator(Gen);
        
        let card = generator.generate(obj)

        let buffer = await PuppeteerInstance.createScreenshotFromHTML(card, ".card");

        let image = await vk.upload.messagePhoto({
            peer_id: message.peerId,
            source: { value: buffer }
        });
        message.reply({
            attachment: image.toString()
        });
    }
}