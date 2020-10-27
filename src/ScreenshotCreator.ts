import { Browser, launch } from "puppeteer";

export default class ScreenshotCreator {
    browser: Browser;

    async launch() {
        this.browser = await launch({ args: ["--no-sandbox"] });
    }

    async create(
        html: string,
        size: [number, number]
    ): Promise<Buffer> {
        const page = await this.browser.newPage();
        const [width, height] = size;
        await page.setContent(html, {
            waitUntil: "networkidle0"
        });
        const image = await page.screenshot({
            type: "jpeg",
            quality: 95,
            clip: {
                x: 0,
                y: 0,
                width,
                height
            }
        });
        return image;
    }
}