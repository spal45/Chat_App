import { Server, Socket } from 'socket.io'
import http from 'http'
import express from "express";
import dotenv from 'dotenv'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { Chat } from '../models/Chat.js'

dotenv.config();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

io.use((socket: AuthenticatedSocket, next) => {
    try {
        const token = socket.handshake.auth?.token as string | undefined;

        if (!token) {
            return next(new Error("Authentication error: token required"));
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        const userId = decodedValue?.user?._id;

        if (!userId) {
            return next(new Error("Authentication error: invalid token"));
        }

        socket.userId = userId.toString();
        next();
    } catch (error) {
        next(new Error("Authentication error: invalid token"));
    }
});

const userSocketMap: Record<string, string> = {};

export const getRecieverSocketId = (recieverId: string):  string | undefined => {
    return userSocketMap[recieverId]
}

io.on("connection", (socket: AuthenticatedSocket)=>{
    console.log("User Conected", socket.id);

    const userId = socket.userId;

    if(userId){
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} mapped to socket ${socket.id}`);
        socket.join(userId)
    }

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("typing",(data)=>{
        if(!userId) return;
        console.log(`User ${userId} is typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit("userTyping",{
            chatId: data.chatId,
            userId
        })
    })

    socket.on("stopTyping",(data)=>{
        if(!userId) return;
        console.log(`User ${userId} stopped typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit("userStoppedTyping",{
            chatId: data.chatId,
            userId,
        })
    })

    socket.on("joinChat", async (chatId)=>{
        if(!userId) return;

        const chat = await Chat.findById(chatId);
        const isMember = !!chat && chat.users.some((u) => u.toString() === userId);

        if(!isMember){
            console.log(`User ${userId} denied join to chat room ${chatId}`);
            return;
        }

        socket.join(chatId)
        console.log(`User ${userId} joined chat room ${chatId}`);
    })

    socket.on("leaveChat",(chatId)=>{
        socket.leave(chatId)
        console.log(`User ${userId} left chat room ${chatId}`);
    })

    socket.on("disconnect",()=>{
        console.log("User Disconnected", socket.id);

        if(userId){
            delete userSocketMap[userId]
            console.log(`User ${userId} removed from online users`);
            io.emit("getOnlineUser", Object.keys(userSocketMap));
        }
    })

    socket.on("connect_error", (error)=> {
        console.log("Socket connection Error", error);
    })
})


export { app, server, io };
