import type { Request, Response, NextFunction } from "express";
import redisClient from "../libs/redisClient";
import { getFromEnv } from "../utils/env";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const key = `requests:${req.ip}`;
    const limit = Number(getFromEnv("API_RATE_LIMIT_PER_MIN"));
    
    // Increment the request count
    const requestCount = await redisClient.incr(key);

    if (requestCount == 1) {
        await redisClient.expire(key, 60);
    }

    if (requestCount > limit) {
        const ttl = await redisClient.ttl(key);
        return res.status(429).json({
            message: `Too many requests, try again in ${ttl} seconds`,
        })
    }

    next();
    
}