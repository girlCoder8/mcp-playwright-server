import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BrowserManager } from '../playwright/browser-manager.js';
import { Logger } from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';
export class MCPPlaywrightServer {
    private server: Server;
    private browserManager: BrowserManager;
    private logger: Logger;
    constructor() {
        this.server = new Server(
            {
                name: 'mcp-playwright-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
            }
        );
        this.browserManager = new BrowserManager();
        this.logger = new Logger('MCPPlaywrightServer');
        this.setupHandlers();
    }
    private setupHandlers(): void {
        // Browser management tools
        this.server.setRequestHandler('tools/call', async (request) => {
            return this.handleToolCall(request);
        });
        // Resource management
        this.server.setRequestHandler('resources/list', async () => {
            return this.listResources();
        });
        // Tool discovery
        this.server.setRequestHandler('tools/list', async () => {
            return this.listTools();
        });
    }
    private async handleToolCall(request: any) {
        const { name, arguments: args } = request.params;

        try {
            validateRequest(request);

            switch (name) {
                case 'browser_launch':
                    return await this.browserManager.launchBrowser(args);
                case 'page_navigate':
                    return await this.browserManager.navigateToPage(args);
                case 'element_click':
                    return await this.browserManager.clickElement(args);
                case 'element_type':
                    return await this.browserManager.typeText(args);
                case 'page_screenshot':
                    return await this.browserManager.takeScreenshot(args);
                case 'browser_close':
                    return await this.browserManager.closeBrowser(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        } catch (error) {
            this.logger.error('Tool call failed', { error: error.message, tool: name });
            throw error;
        }
    }
    async start(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        this.logger.info('MCP Playwright Server started successfully');
    }
}
