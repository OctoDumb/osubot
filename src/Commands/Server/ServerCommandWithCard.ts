import VK from "vk-io";
import CardGenerator from "../../Cards/CardGenerator";
import Message from "../../Message";
import PuppeteerInstance from "../../PuppeteerInstance";
import ServerCommand from "./ServerCommand";

export interface ISendCardArguments<T> {
    vk: VK;
    message: Message;
    obj: T;
}

export default abstract class ServerCommandWithCard<T, U> extends ServerCommand<T> {
    protected abstract readonly cardGenerator: CardGenerator<U>;

    protected async sendCard({ vk, message, obj }: ISendCardArguments<U>): Promise<void> {
        let card = this.cardGenerator.generate(obj)

        let buffer = await PuppeteerInstance.createScreenshotFromHTML(card);

        let image = await vk.upload.messagePhoto({
            peer_id: message.peerId,
            source: { value: buffer }
        });
        message.reply({
            attachment: image.toString()
        });
    }
}