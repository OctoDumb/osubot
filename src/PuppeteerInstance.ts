import { Browser, launch } from "puppeteer";

export default class PuppeteerInstance {
    browser: Browser;

    async launch() {
        this.browser = await launch({ args: ["--no-sandbox"] });
    }

    async createScreenshotFromHTML(
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

        page.close();

        return image;
    }

    async getHTMLPageContent(url: string, waitFor: number = 0) {
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