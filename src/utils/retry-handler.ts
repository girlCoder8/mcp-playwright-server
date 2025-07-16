import { ErrorCode, MCPPlaywrightError } from './error-handler.js';
import { Logger } from './logger.js';
interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors: ErrorCode[];
}
export class RetryHandler {
    private config: RetryConfig;
    private logger: Logger;
    constructor(config: Partial<RetryConfig> = {}) {
        this.config = {
            maxAttempts: 3,
            baseDelayMs: 1000,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
            retryableErrors: [
                ErrorCode.TIMEOUT_EXCEEDED,
                ErrorCode.PAGE_NAVIGATION_FAILED,
                ErrorCode.ELEMENT_NOT_FOUND
            ],
            ...config
        };
        this.logger = new Logger('RetryHandler');
    }
    async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (!this.shouldRetry(error, attempt)) {
                    break;
                }
                const delay = this.calculateDelay(attempt);
                this.logger.warn(`Retry attempt ${attempt}/${this.config.maxAttempts}`, {
                    context,
                    error: error.message,
                    nextRetryIn: delay
                });
                await this.sleep(delay);
            }
        }
        throw lastError!;
    }
    private shouldRetry(error: Error, attempt: number): boolean {
        if (attempt >= this.config.maxAttempts) {
            return false;
        }
        if (error instanceof MCPPlaywrightError) {
            return error.retryable && this.config.retryableErrors.includes(error.code);
        }
        // Default retry logic for non-MCP errors
        return true;
    }
    private calculateDelay(attempt: number): number {
        const delay = this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
        return Math.min(delay, this.config.maxDelayMs);
    }
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
