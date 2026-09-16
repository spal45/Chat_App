import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import connectDb from "./config/db.js"
import { createClient } from "redis";
import userRoutes from './routes/user.js'
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { apiLimiter } from "./config/rateLimiter.js";
import cors from 'cors'


dotenv.config();
connectDb();
connectRabbitMQ();

export const redisClient = createClient({
    url: process.env.REDIS_URL!,
});

redisClient
    .connect()
    .then(()=>console.log("connected to redis"))
    .catch((err)=>console.error(err))

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

const app = express()
// hsts disabled: this service is always plain HTTP (no TLS listener here).
// Sending HSTS over HTTP makes Chrome force-upgrade localhost dev traffic
// to HTTPS and fail outright. If this ever sits behind a TLS-terminating
// reverse proxy in production, set HSTS there instead.
app.use(helmet({ hsts: false }));
app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
}));

app.use("/api/v1", apiLimiter, userRoutes);

const port = process.env.PORT || 5003;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})