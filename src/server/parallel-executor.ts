import { BrowserManager } from '../playwright/browser-manager.js';
import { Logger } from '../utils/logger.js';
import { TestScenario, TestResult } from '../types/index.js';
export class ParallelTestExecutor {
    private browserManager: BrowserManager;
    private logger: Logger;
    private maxConcurrency: number;
    private runningTests: Map<string, Promise<TestResult>> = new Map();
    constructor(maxConcurrency: number = 5) {
        this.browserManager = new BrowserManager();
        this.logger = new Logger('ParallelTestExecutor');
        this.maxConcurrency = maxConcurrency;
    }
    async executeTestBatch(scenarios: TestScenario[]): Promise<TestResult[]> {
        const results: TestResult[] = [];
        const batches = this.createBatches(scenarios, this.maxConcurrency);
        for (const batch of batches) {
            const batchPromises = batch.map(scenario =>
                this.executeScenario(scenario)
            );
            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    this.logger.error('Batch execution failed', {
                        scenarioId: batch[index].id,
                        error: result.reason
                    });
                }
            });
        }
        return results;
    }
    private createBatches<T>(items: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    private async executeScenario(scenario: TestScenario): Promise<TestResult> {
        // Implementation details would follow the pattern established earlier
        // This is a simplified version for brevity
        return this.logger.measurePerformance(
            `scenario-${scenario.id}`,
            async () => {
                // Scenario execution logic here
                return {} as TestResult;
            }
        );
    }
}
