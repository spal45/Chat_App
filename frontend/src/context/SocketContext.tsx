"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client"
import Cookies from "js-cookie";
import { chat_service, useAppData } from "./AppContext";

interface SocketContextType{
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: []
})

interface ProviderProps{
    children: ReactNode;
}

export const SocketProvider = ({children}: ProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const {user} = useAppData()
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(()=>{
        if(!user?._id) return

        const token = Cookies.get("token");
        if(!token) return

        const newSocket = io(chat_service, {
            auth: {
                token
            }
        });

        setSocket(newSocket);

        newSocket.on("getOnlineUser", (users: string[])=>{
            setOnlineUsers(users);
        });

        newSocket.on("connect_error", (error)=>{
            console.log("Socket connection error", error.message);
        });

        return ()=>{
            newSocket.disconnect()
        }
    },[user?._id])

    return <SocketContext.Provider value={{socket, onlineUsers}}>
        {children}
    </SocketContext.Provider>
};

export const SocketData = () => useContext(SocketContext);
