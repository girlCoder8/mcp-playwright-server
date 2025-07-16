export interface StandardResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        timestamp: string;
        requestId?: string;
        executionTime?: number;
    };
}
export class ResponseFormatter {
    static success<T>(data: T, metadata?: any): StandardResponse<T> {
        return {
            success: true,
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                ...metadata
            }
        };
    }
    static error(code: string, message: string, details?: any): StandardResponse {
        return {
            success: false,
            error: {
                code,
                message,
                details
            },
            metadata: {
                timestamp: new Date().toISOString()
            }
        };
    }
    static async withTiming<T>(
        operation: () => Promise<T>,
        requestId?: string
    ): Promise<StandardResponse<T>> {
        const startTime = Date.now();

        try {
            const result = await operation();
            const executionTime = Date.now() - startTime;

            return this.success(result, { executionTime, requestId });
        } catch (error) {
            const executionTime = Date.now() - startTime;

            return this.error(
                'OPERATION_FAILED',
                error.message,
                { executionTime, requestId, stack: error.stack }
            );
        }
    }
}
