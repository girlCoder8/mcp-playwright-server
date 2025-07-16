export enum ErrorCode {
    BROWSER_LAUNCH_FAILED = 'BROWSER_LAUNCH_FAILED',
    PAGE_NAVIGATION_FAILED = 'PAGE_NAVIGATION_FAILED',
    ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
    TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
    SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}
export class MCPPlaywrightError extends Error {
    constructor(
        public code: ErrorCode,
        message: string,
        public details?: any,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = 'MCPPlaywrightError';
    }
}
export class ErrorHandler {
    private static errorMappings: Map<string, ErrorCode> = new Map([
        ['TimeoutError', ErrorCode.TIMEOUT_EXCEEDED],
        ['Navigation failed', ErrorCode.PAGE_NAVIGATION_FAILED],
        ['Element not found', ErrorCode.ELEMENT_NOT_FOUND]
    ]);
    static handlePlaywrightError(error: any): MCPPlaywrightError {
        const errorCode = this.mapErrorToCode(error);
        const retryable = this.isRetryableError(errorCode);

        return new MCPPlaywrightError(
            errorCode,
            error.message,
            {
                originalError: error.name,
                stack: error.stack
            },
            retryable
        );
    }
    private static mapErrorToCode(error: any): ErrorCode {
        for (const [pattern, code] of this.errorMappings) {
            if (error.message.includes(pattern) || error.name.includes(pattern)) {
                return code;
            }
        }
        return ErrorCode.INTERNAL_ERROR;
    }
    private static isRetryableError(code: ErrorCode): boolean {
        const retryableCodes = [
            ErrorCode.TIMEOUT_EXCEEDED,
            ErrorCode.PAGE_NAVIGATION_FAILED
        ];
        return retryableCodes.includes(code);
    }
}