import express from 'express';
import dotenv from 'dotenv'
import helmet from 'helmet'
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js'
import cors from 'cors';
import { app, server } from './config/socket.js';
import { apiLimiter } from './config/rateLimiter.js';

dotenv.config();
connectDb();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

// hsts disabled: this service is always plain HTTP (no TLS listener here).
// Sending HSTS over HTTP makes Chrome force-upgrade localhost dev traffic
// to HTTPS and fail outright. If this ever sits behind a TLS-terminating
// reverse proxy in production, set HSTS there instead.
app.use(helmet({ hsts: false }));
app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
}))

app.use("/api/v1", apiLimiter, chatRoutes);

const port = process.env.PORT;

server.listen(port,()=>{
    console.log(`Server id running on port ${port}`);
})