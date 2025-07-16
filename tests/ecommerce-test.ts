import { AutomatedTestServer } from '../src/server/test-server.js';
async function createEcommerceTest() {
    const testServer = new AutomatedTestServer();
    await testServer.start();
    // Create comprehensive e-commerce test scenario
    const { scenarioId } = await testServer.createTestScenario({
        name: 'Complete Checkout Flow',
        description: 'Test the entire customer purchase journey from product selection to order confirmation',
        baseUrl: 'https://demo-shop.playwright.dev',
        steps: [
            {
                action: 'navigate',
                value: '/products'
            },
            {
                action: 'click',
                target: '[data-testid="product-item"]:first-child',
                assertions: [
                    {
                        type: 'visible',
                        target: '[data-testid="product-details"]',
                        expected: 'true'
                    }
                ]
            },
            {
                action: 'click',
                target: '[data-testid="add-to-cart"]',
                assertions: [
                    {
                        type: 'text',
                        target: '[data-testid="cart-count"]',
                        expected: '1'
                    }
                ]
            },
            {
                action: 'click',
                target: '[data-testid="cart-icon"]'
            },
            {
                action: 'click',
                target: '[data-testid="checkout-button"]'
            },
            {
                action: 'type',
                target: '[data-testid="email-input"]',
                value: 'test@example.com'
            },
            {
                action: 'type',
                target: '[data-testid="first-name"]',
                value: 'John'
            },
            {
                action: 'type',
                target: '[data-testid="last-name"]',
                value: 'Doe'
            },
            {
                action: 'click',
                target: '[data-testid="submit-order"]',
                assertions: [
                    {
                        type: 'url',
                        target: 'current',
                        expected: '/order-confirmation'
                    },
                    {
                        type: 'visible',
                        target: '[data-testid="success-message"]',
                        expected: 'true'
                    }
                ]
            }
        ],
        tags: ['ecommerce', 'checkout', 'critical-path']
    });
    // Execute the test
    const result = await testServer.executeTestScenario({
        scenarioId,
        options: {
            headless: false, // Run in headed mode for debugging
            browserType: 'chromium',
            timeout: 10000
        }
    });
    console.log('Test execution completed:', {
        status: result.status,
        duration: result.duration,
        steps: result.steps.length,
        screenshots: result.screenshots.length
    });
    return result;
}