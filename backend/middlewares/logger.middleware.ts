import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const startHrTime = process.hrtime();
    const { method, url } = req;
    const requestTime = new Date().toISOString();
    console.log(`[${requestTime}] Incoming Request: ${method} ${url}`);

    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(3);
        const { statusCode } = res;
        const responseTime = new Date().toISOString();
        console.log(`  [${responseTime}] Outgoing Response: ${method} ${url} ${statusCode} - ${elapsedTimeInMs} ms`);
    });

    next();
} 