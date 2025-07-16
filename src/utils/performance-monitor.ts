export interface PerformanceMetrics {
    sessionId: string;
    operation: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage: NodeJS.MemoryUsage;
    browserMetrics?: {
        pageLoadTime: number;
        domContentLoaded: number;
        firstContentfulPaint: number;
    };
}
export class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private logger: Logger;
    constructor() {
        this.logger = new Logger('PerformanceMonitor');
    }
    async measureOperation<T>(
        sessionId: string,
        operation: string,
        fn: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        const initialMemory = process.memoryUsage();
        try {
            const result = await fn();
            const endTime = Date.now();
            const finalMemory = process.memoryUsage();
            const metrics: PerformanceMetrics = {
                sessionId,
                operation,
                startTime,
                endTime,
                duration: endTime - startTime,
                memoryUsage: {
                    rss: finalMemory.rss - initialMemory.rss,
                    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
                    external: finalMemory.external - initialMemory.external,
                    arrayBuffers: finalMemory.arrayBuffers - initialMemory.arrayBuffers
                }
            };
            this.metrics.push(metrics);
            this.analyzePerformance(metrics);
            return result;
        } catch (error) {
            this.logger.error('Operation failed during performance measurement', {
                sessionId,
                operation,
                duration: Date.now() - startTime,
                error: error.message
            });
            throw error;
        }
    }
    private analyzePerformance(metrics: PerformanceMetrics): void {
        // Alert on slow operations
        if (metrics.duration > 10000) { // 10 seconds
            this.logger.warn('Slow operation detected', {
                operation: metrics.operation,
                duration: metrics.duration,
                sessionId: metrics.sessionId
            });
        }
        // Alert on high memory usage
        if (metrics.memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
            this.logger.warn('High memory usage detected', {
                operation: metrics.operation,
                memoryUsed: metrics.memoryUsage.heapUsed,
                sessionId: metrics.sessionId
            });
        }
    }
    getMetricsSummary(): any {
        if (this.metrics.length === 0) {
            return { message: 'No metrics collected yet' };
        }
        const operations = new Map<string, PerformanceMetrics[]>();

        this.metrics.forEach(metric => {
            if (!operations.has(metric.operation)) {
                operations.set(metric.operation, []);
            }
            operations.get(metric.operation)!.push(metric);
        });
        const summary = {
            totalOperations: this.metrics.length,
            operationBreakdown: {} as any,
            overallStats: {
                averageDuration: 0,
                totalDuration: 0,
                slowestOperation: null as any,
                fastestOperation: null as any
            }
        };
        let totalDuration = 0;
        let slowest: PerformanceMetrics | null = null;
        let fastest: PerformanceMetrics | null = null;
        for (const [operation, metrics] of operations) {
            const durations = metrics.map(m => m.duration);
            const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
            const maxDuration = Math.max(...durations);
            const minDuration = Math.min(...durations);
            summary.operationBreakdown[operation] = {
                count: metrics.length,
                averageDuration: Math.round(avgDuration),
                maxDuration,
                minDuration,
                totalDuration: durations.reduce((a, b) => a + b, 0)
            };
            totalDuration += summary.operationBreakdown[operation].totalDuration;
            const slowestInGroup = metrics.find(m => m.duration === maxDuration);
            const fastestInGroup = metrics.find(m => m.duration === minDuration);
            if (!slowest || slowestInGroup!.duration > slowest.duration) {
                slowest = slowestInGroup!;
            }
            if (!fastest || fastestInGroup!.duration < fastest.duration) {
                fastest = fastestInGroup!;
            }
        }
        summary.overallStats = {
            averageDuration: Math.round(totalDuration / this.metrics.length),
            totalDuration,
            slowestOperation: slowest,
            fastestOperation: fastest
        };
        return summary;
    }
}
