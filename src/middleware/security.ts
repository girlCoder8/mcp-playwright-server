import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
export const securityMiddleware = [
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    }),

    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    })
];
export function validateOrigin(allowedOrigins: string[]) {
    return (req: any, res: any, next: any) => {
        const origin = req.headers.origin;

        if (!origin || !allowedOrigins.includes(origin)) {
            return res.status(403).json({
                error: 'Origin not allowed',
                code: 'FORBIDDEN_ORIGIN'
            });
        }

        next();
    };
}


