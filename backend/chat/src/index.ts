import express from 'express';
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js'
import cors from 'cors';
import { app, server } from './config/socket.js';

dotenv.config();
connectDb();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
}))

app.use("/api/v1", chatRoutes);

const port = process.env.PORT;

server.listen(port,()=>{
    console.log(`Server id running on port ${port}`);
})