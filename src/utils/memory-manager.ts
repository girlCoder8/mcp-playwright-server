export class MemoryManager {
    private logger: Logger;
    private cleanupInterval: NodeJS.Timeout;
    private maxSessionAge: number = 30 * 60 * 1000; // 30 minutes
    constructor(private browserManager: BrowserManager) {
        this.logger = new Logger('MemoryManager');
        this.startPeriodicCleanup();
    }
    private startPeriodicCleanup(): void {
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    private async performCleanup(): Promise<void> {
        const memoryBefore = process.memoryUsage();

        try {
            // Clean up expired sessions
            await this.browserManager.cleanupExpiredSessions(this.maxSessionAge);

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            const memoryAfter = process.memoryUsage();
            const memoryFreed = memoryBefore.heapUsed - memoryAfter.heapUsed;
            this.logger.info('Memory cleanup completed', {
                memoryFreed,
                heapUsedBefore: memoryBefore.heapUsed,
                heapUsedAfter: memoryAfter.heapUsed
            });
        } catch (error) {
            this.logger.error('Memory cleanup failed', { error: error.message });
        }
    }
    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}