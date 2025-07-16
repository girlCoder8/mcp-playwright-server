import Joi from 'joi';
const schemas = {
    browserLaunch: Joi.object({
        browserType: Joi.string().valid('chromium', 'firefox', 'webkit').default('chromium'),
        headless: Joi.boolean().default(true),
        viewport: Joi.object({
            width: Joi.number().min(320).max(3840).default(1920),
            height: Joi.number().min(240).max(2160).default(1080)
        }).default({ width: 1920, height: 1080 }),
        userAgent: Joi.string().optional()
    }),
    pageNavigation: Joi.object({
        sessionId: Joi.string().uuid().required(),
        url: Joi.string().uri().required(),
        waitUntil: Joi.string().valid('load', 'domcontentloaded', 'networkidle').default('load'),
        timeout: Joi.number().min(1000).max(60000).default(30000)
    }),
    elementInteraction: Joi.object({
        sessionId: Joi.string().uuid().required(),
        pageId: Joi.string().uuid().required(),
        selector: Joi.string().required(),
        options: Joi.object({
            timeout: Joi.number().min(1000).max(30000).default(5000),
            force: Joi.boolean().default(false),
            position: Joi.object({
                x: Joi.number().required(),
                y: Joi.number().required()
            }).optional()
        }).default({})
    })
};
export function validateRequest(request: any): void {
    const { name, arguments: args } = request.params;
    let schema: Joi.ObjectSchema;
    switch (name) {
        case 'browser_launch':
            schema = schemas.browserLaunch;
            break;
        case 'page_navigate':
            schema = schemas.pageNavigation;
            break;
        case 'element_click':
        case 'element_type':
            schema = schemas.elementInteraction;
            break;
        default:
            return; // Skip validation for unknown tools
    }
    const { error, value } = schema.validate(args);
    if (error) {
        throw new Error(`Validation failed: ${error.details[0].message}`);
    }
    // Update request with validated and defaulted values
    request.params.arguments = value;
}
