import { Browser, launch } from "puppeteer";

export default class PuppeteerInstance {
    static browser: Browser;

    static async initialize() {
        this.browser = await launch({ args: ["--no-sandbox"] });
    }

    static async createScreenshotFromHTML(html: string): Promise<Buffer> {
        const page = await this.browser.newPage();
        await page.setContent(html, {
            waitUntil: "networkidle0"
        });
        const [ width, height ] = await page.$eval("body", el => ([ el.clientWidth, el.clientHeight ]));
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