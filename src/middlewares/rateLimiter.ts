import type { Request, Response, NextFunction } from "express";
import redisClient from "../libs/redisClient";
import { getFromEnv } from "../utils/env";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const key = `requests:${req.ip}`;
    const limit = Number(getFromEnv("API_RATE_LIMIT_PER_MIN"));
    
    // Get the request count and ttl
    const requestCount = await redisClient.get(key);
    const ttl = await redisClient.ttl(key);

    if (requestCount) {
        // Check if the request count has exceeded the api limit
        if (Number(requestCount) >= limit) {
            return res.status(429).json({
                message: `Too many requests, try again in ${ttl} seconds`,
            })
        }

        // increment the req count if not exceeded
        await redisClient.incr(key);
        next();
        return;
    }

    // set the request count if not found
    await redisClient.setEx(key, 60, "1");
    next();
}