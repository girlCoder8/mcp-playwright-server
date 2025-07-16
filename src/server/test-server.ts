import { MCPPlaywrightServer } from './index.js';
import { TestScenario, TestResult } from '../types/index.js';
import { Logger } from '../utils/logger.js';
export class AutomatedTestServer extends MCPPlaywrightServer {
    private testScenarios: Map<string, TestScenario> = new Map();
    private testResults: TestResult[] = [];
    private logger: Logger;
    constructor() {
        super();
        this.logger = new Logger('AutomatedTestServer');
        this.setupTestHandlers();
    }
    private setupTestHandlers(): void {
        // Extended handler setup for test-specific operations
        this.server.setRequestHandler('test/scenario/create', async (request) => {
            return this.createTestScenario(request.params);
        });
        this.server.setRequestHandler('test/scenario/execute', async (request) => {
            return this.executeTestScenario(request.params);
        });
        this.server.setRequestHandler('test/results/get', async (request) => {
            return this.getTestResults(request.params);
        });
    }
    async createTestScenario(params: {
        name: string;
        description: string;
        steps: Array<{
            action: string;
            target?: string;
            value?: string;
            assertions?: Array<{
                type: 'visible' | 'text' | 'attribute' | 'url';
                target: string;
                expected: string;
            }>;
        }>;
        baseUrl: string;
        tags?: string[];
    }): Promise<{ scenarioId: string }> {
        const scenarioId = uuidv4();
        const scenario: TestScenario = {
            id: scenarioId,
            ...params,
            createdAt: new Date(),
            status: 'created'
        };
        this.testScenarios.set(scenarioId, scenario);
        this.logger.info('Test scenario created', { scenarioId, name: params.name });
        return { scenarioId };
    }
    async executeTestScenario(params: {
        scenarioId: string;
        options?: {
            headless?: boolean;
            browserType?: 'chromium' | 'firefox' | 'webkit';
            timeout?: number;
        };
    }): Promise<TestResult> {
        const { scenarioId, options = {} } = params;
        const scenario = this.testScenarios.get(scenarioId);
        if (!scenario) {
            throw new Error(`Test scenario not found: ${scenarioId}`);
        }
        const testResult: TestResult = {
            id: uuidv4(),
            scenarioId,
            startTime: new Date(),
            status: 'running',
            steps: [],
            screenshots: [],
            errors: []
        };
        try {
            // Launch browser for test execution
            const { sessionId } = await this.browserManager.launchBrowser({
                browserType: options.browserType || 'chromium',
                headless: options.headless !== false
            });
            // Navigate to base URL
            const { pageId } = await this.browserManager.navigateToPage({
                sessionId,
                url: scenario.baseUrl
            });
            // Execute test steps
            for (const [index, step] of scenario.steps.entries()) {
                const stepResult = await this.executeTestStep({
                    sessionId,
                    pageId,
                    step,
                    stepIndex: index,
                    timeout: options.timeout
                });
                testResult.steps.push(stepResult);
                if (!stepResult.success) {
                    testResult.status = 'failed';
                    break;
                }
            }
            // Clean up browser session
            await this.browserManager.closeBrowser({ sessionId });
            if (testResult.status !== 'failed') {
                testResult.status = 'passed';
            }
        } catch (error) {
            testResult.status = 'error';
            testResult.errors.push({
                message: error.message,
                stack: error.stack,
                timestamp: new Date()
            });
        }
        testResult.endTime = new Date();
        testResult.duration = testResult.endTime.getTime() - testResult.startTime.getTime();
        this.testResults.push(testResult);
        this.logger.info('Test scenario execution completed', {
            scenarioId,
            status: testResult.status,
            duration: testResult.duration
        });
        return testResult;
    }
    private async executeTestStep(params: {
        sessionId: string;
        pageId: string;
        step: any;
        stepIndex: number;
        timeout?: number;
    }): Promise<any> {
        const { sessionId, pageId, step, stepIndex, timeout = 5000 } = params;
        const stepResult = {
            index: stepIndex,
            action: step.action,
            target: step.target,
            value: step.value,
            success: false,
            startTime: new Date(),
            endTime: null as Date | null,
            duration: 0,
            screenshot: null as string | null,
            error: null as string | null
        };
        try {
            switch (step.action) {
                case 'navigate':
                    await this.browserManager.navigateToPage({
                        sessionId,
                        url: step.value,
                        timeout
                    });
                    break;
                case 'click':
                    await this.browserManager.clickElement({
                        sessionId,
                        pageId,
                        selector: step.target,
                        options: { timeout }
                    });
                    break;
                case 'type':
                    await this.browserManager.typeText({
                        sessionId,
                        pageId,
                        selector: step.target,
                        text: step.value,
                        options: { timeout }
                    });
                    break;
                case 'wait':
                    await new Promise(resolve => setTimeout(resolve, parseInt(step.value)));
                    break;
                default:
                    throw new Error(`Unknown action: ${step.action}`);
            }
            // Execute assertions if present
            if (step.assertions) {
                for (const assertion of step.assertions) {
                    await this.executeAssertion({
                        sessionId,
                        pageId,
                        assertion,
                        timeout
                    });
                }
            }
            stepResult.success = true;
        } catch (error) {
            stepResult.error = error.message;
            stepResult.success = false;
        }
        stepResult.endTime = new Date();
        stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
        return stepResult;
    }
}
