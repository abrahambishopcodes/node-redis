import "dotenv/config";
import express, {type Request, type Response, type NextFunction} from "express";
import redisClient from "./libs/redisClient";
import { rateLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(rateLimiter);

// test route to check rate limiter
app.get("/test", (req: Request, res: Response) => {
    res.json({ message: "Test route" });
})

app.listen(5500, () => {
    console.log("Server is running on port 5500");
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        errorName: err.name,
        message: err.message,
    })
})