import winston from 'winston';
import path from 'path';
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}
export class Logger {
    private winston: winston.Logger;
    private context: string;
    constructor(context: string) {
        this.context = context;
        this.winston = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
                winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                    return JSON.stringify({
                        timestamp,
                        level,
                        context,
                        message,
                        ...meta
                    });
                })
            ),
            defaultMeta: { context: this.context },
            transports: [
                new winston.transports.File({
                    filename: path.join('logs', 'error.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                new winston.transports.File({
                    filename: path.join('logs', 'combined.log'),
                    maxsize: 5242880,
                    maxFiles: 5
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }
    info(message: string, meta?: any): void {
        this.winston.info(message, meta);
    }
    error(message: string, meta?: any): void {
        this.winston.error(message, meta);
    }
    warn(message: string, meta?: any): void {
        this.winston.warn(message, meta);
    }
    debug(message: string, meta?: any): void {
        this.winston.debug(message, meta);
    }
    // Performance logging
    async measurePerformance<T>(
        operation: string,
        fn: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            this.info(`Operation completed: ${operation}`, { duration });
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.error(`Operation failed: ${operation}`, { duration, error: error.message });
            throw error;
        }
    }
}
