import { Browser, launch } from "puppeteer";

export default class PuppeteerInstance {
    static browser: Browser;

    static async initialize() {
        this.browser = await launch({
            args: [
                "--window-size=1920,1080",
                "--no-sandbox"
            ],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
    }

    static async createScreenshotFromHTML(html: string, selector: string = "body"): Promise<Buffer> {
        const page = await this.browser.newPage();
        await page.setContent(html, {
            waitUntil: "networkidle0"
        });
        const clip = await (await page.$(selector)).boundingBox();
        const image = await page.screenshot({
            type: "jpeg",
            quality: 95,
            clip
        });

        page.close();

        return image;
    }

    static async getHTMLPageContent(url: string, waitFor: number = 0) {
        try {
            const page = await this.browser.newPage();
            await page.goto(url, { waitUntil: "networkidle0"});
            await page.waitFor(waitFor)

            const content = await page.content();
            page.close();

            return content;
        } catch(e) {
            console.log(e);
        }
    }
}