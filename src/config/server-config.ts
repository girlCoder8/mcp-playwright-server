import dotenv from 'dotenv';
dotenv.config();
export interface ServerConfig {
    port: number;
    logLevel: string;
    maxConcurrentSessions: number;
    sessionTimeout: number;
    retryAttempts: number;
    defaultBrowser: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
    screenshot: {
        enabled: boolean;
        quality: number;
        fullPage: boolean;
    };
}
export const config: ServerConfig = {
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info',
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '10'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '300000'), // 5 minutes
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    defaultBrowser: (process.env.DEFAULT_BROWSER as any) || 'chromium',
    headless: process.env.HEADLESS !== 'false',
    screenshot: {
        enabled: process.env.SCREENSHOT_ENABLED !== 'false',
        quality: parseInt(process.env.SCREENSHOT_QUALITY || '80'),
        fullPage: process.env.SCREENSHOT_FULL_PAGE === 'true'
    }
};