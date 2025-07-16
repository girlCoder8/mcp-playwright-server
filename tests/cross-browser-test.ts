import {AutomatedTestServer} from "../src/server/test-server";

export async function runCrossBrowserTest() {
    const testServer = new AutomatedTestServer();
    const browsers = ['chromium', 'firefox', 'webkit'];
    const results = new Map();
    for (const browser of browsers) {
        try {
            console.log(`Testing on ${browser}...`);

            const result = await testServer.executeTestScenario({
                scenarioId: 'your-scenario-id',
                options: {
                    browserType: browser as any,
                    headless: true,
                    timeout: 15000
                }
            });
            results.set(browser, result);

            console.log(`${browser} test completed:`, {
                status: result.status,
                duration: result.duration
            });
        } catch (error) {
            console.error(`${browser} test failed:`, error.message);
            results.set(browser, { status: 'error', error: error.message });
        }
    }
    // Generate cross-browser compatibility report
    const report = generateCompatibilityReport(results);
    console.log('Cross-browser compatibility report:', report);

    return report;
}
function generateCompatibilityReport(results: Map<string, any>) {
    const report = {
        summary: {
            totalBrowsers: results.size,
            passed: 0,
            failed: 0,
            errors: 0
        },
        details: {} as any,
        recommendations: [] as string[]
    };
    for (const [browser, result] of results) {
        report.details[browser] = {
            status: result.status,
            duration: result.duration,
            issues: result.errors || []
        };
        switch (result.status) {
            case 'passed':
                report.summary.passed++;
                break;
            case 'failed':
                report.summary.failed++;
                break;
            case 'error':
                report.summary.errors++;
                break;
        }
    }
    // Generate recommendations based on results
    if (report.summary.failed > 0) {
        report.recommendations.push('Review failed tests and implement browser-specific fixes');
    }

    if (report.summary.errors > 0) {
        report.recommendations.push('Investigate test infrastructure issues');
    }
    return report;
}