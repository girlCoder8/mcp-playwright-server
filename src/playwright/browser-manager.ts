import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { Logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
interface BrowserSession {
    id: string;
    browser: Browser;
    context: BrowserContext;
    pages: Map<string, Page>;
    metadata: {
        browserType: string;
        launchTime: Date;
        lastActivity: Date;
    };
}
export class BrowserManager {
    private sessions: Map<string, BrowserSession> = new Map();
    private logger: Logger;
    constructor() {
        this.logger = new Logger('BrowserManager');
    }
    async launchBrowser(options: {
        browserType?: 'chromium' | 'firefox' | 'webkit';
        headless?: boolean;
        viewport?: { width: number; height: number };
        userAgent?: string;
    } = {}): Promise<{ sessionId: string }> {
        const {
            browserType = 'chromium',
            headless = true,
            viewport = { width: 1920, height: 1080 },
            userAgent
        } = options;
        try {
            let browser: Browser;

            switch (browserType) {
                case 'firefox':
                    browser = await firefox.launch({ headless });
                    break;
                case 'webkit':
                    browser = await webkit.launch({ headless });
                    break;
                default:
                    browser = await chromium.launch({ headless });
            }
            const context = await browser.newContext({
                viewport,
                userAgent
            });
            const sessionId = uuidv4();
            const session: BrowserSession = {
                id: sessionId,
                browser,
                context,
                pages: new Map(),
                metadata: {
                    browserType,
                    launchTime: new Date(),
                    lastActivity: new Date()
                }
            };
            this.sessions.set(sessionId, session);
            this.logger.info('Browser session created', { sessionId, browserType });
            return { sessionId };
        } catch (error) {
            this.logger.error('Failed to launch browser', { error: error.message });
            throw new Error(`Browser launch failed: ${error.message}`);
        }
    }
    async navigateToPage(args: {
        sessionId: string;
        url: string;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
        timeout?: number;
    }): Promise<{ pageId: string; title: string; url: string }> {
        const { sessionId, url, waitUntil = 'load', timeout = 30000 } = args;

        const session = this.getSession(sessionId);

        try {
            const page = await session.context.newPage();
            const pageId = uuidv4();

            await page.goto(url, { waitUntil, timeout });

            session.pages.set(pageId, page);
            session.metadata.lastActivity = new Date();

            const title = await page.title();
            const currentUrl = page.url();

            this.logger.info('Page navigation completed', {
                sessionId,
                pageId,
                url: currentUrl,
                title
            });

            return { pageId, title, url: currentUrl };
        } catch (error) {
            this.logger.error('Page navigation failed', {
                sessionId,
                url,
                error: error.message
            });
            throw new Error(`Navigation failed: ${error.message}`);
        }
    }
    async clickElement(args: {
        sessionId: string;
        pageId: string;
        selector: string;
        options?: {
            timeout?: number;
            force?: boolean;
            position?: { x: number; y: number };
        };
    }): Promise<{ success: boolean; elementInfo?: any }> {
        const { sessionId, pageId, selector, options = {} } = args;

        const page = this.getPage(sessionId, pageId);

        try {
            await page.waitForSelector(selector, { timeout: options.timeout || 5000 });

            const element = await page.locator(selector);
            const elementInfo = await this.getElementInfo(element);

            await element.click({
                force: options.force,
                position: options.position,
                timeout: options.timeout
            });

            this.updateSessionActivity(sessionId);

            this.logger.info('Element clicked successfully', {
                sessionId,
                pageId,
                selector,
                elementInfo
            });

            return { success: true, elementInfo };
        } catch (error) {
            this.logger.error('Element click failed', {
                sessionId,
                pageId,
                selector,
                error: error.message
            });
            throw new Error(`Click failed: ${error.message}`);
        }
    }
    private getSession(sessionId: string): BrowserSession {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        return session;
    }
    private getPage(sessionId: string, pageId: string): Page {
        const session = this.getSession(sessionId);
        const page = session.pages.get(pageId);
        if (!page) {
            throw new Error(`Page not found: ${pageId}`);
        }
        return page;
    }
    private updateSessionActivity(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.metadata.lastActivity = new Date();
        }
    }
    private async getElementInfo(element: any): Promise<any> {
        try {
            return await element.evaluate((el: Element) => ({
                tagName: el.tagName,
                textContent: el.textContent?.trim(),
                className: el.className,
                id: el.id,
                attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {} as Record<string, string>)
            }));
        } catch {
            return null;
        }
    }
}
