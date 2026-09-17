"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie'
import axios from "axios";
import toast, {Toaster} from 'react-hot-toast'

export const user_service = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5003";
export const chat_service = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:5004";

export interface User{
    _id: string;
    name: string;
    email: string;
}

export interface Chat {
    _id: string;
    users: string[];
    latestMessage: {
        text: string;
        sender: string;
    };
    createAt: string;
    updatedAt: string;
    unseenCount?: number;
}

export interface Chats {
    _id: string;
    user: User;
    chat: Chat;
}

interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser?: () => Promise<void>;
    fetchUsers?: () => Promise<void>;
    fetchChats?: () => Promise<void>;
    fetchMoreChats?: () => Promise<void>;
    chats?: Chats[] | null;
    hasMoreChats?: boolean;
    loadingMoreChats?: boolean;
    users?: User[] | null;
    setChats?: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    async function fetchUser(){
        try{
            const token = Cookies.get("token")
            const {data} = await axios.get(`${user_service}/api/v1/me`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(data);
            setIsAuth(true);
            setLoading(false);
        }catch(error){
            console.log(error)
            setLoading(false);
        }
    }

    async function logoutUser() {
        Cookies.remove("token")
        setUser(null)
        setIsAuth(false)
        toast.success("User Logged Out");
    }

    const [chats, setChats] = useState<Chats[] | null>(null)
    const [hasMoreChats, setHasMoreChats] = useState(true)
    const [loadingMoreChats, setLoadingMoreChats] = useState(false)
    const [chatsPage, setChatsPage] = useState(1)
    const CHATS_PAGE_SIZE = 20;

    async function fetchChats() {
        const token = Cookies.get("token");
        try{
            const {data} = await axios.get(`${chat_service}/api/v1/chat/all?page=1&limit=${CHATS_PAGE_SIZE}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setChats(data.chats);
            setHasMoreChats(data.hasMore);
            setChatsPage(1);
        }catch(error){
            console.log(error);
        }
    }

    async function fetchMoreChats() {
        if(!hasMoreChats || loadingMoreChats) return;

        const token = Cookies.get("token");
        const nextPage = chatsPage + 1;
        setLoadingMoreChats(true);
        try{
            const {data} = await axios.get(`${chat_service}/api/v1/chat/all?page=${nextPage}&limit=${CHATS_PAGE_SIZE}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setChats((prev) => [...(prev ?? []), ...data.chats]);
            setHasMoreChats(data.hasMore);
            setChatsPage(nextPage);
        }catch(error){
            console.log(error);
        }finally{
            setLoadingMoreChats(false);
        }
    }

    const [users, setUsers] = useState<User[] | null>(null)
    async function fetchUsers() {
        const token = Cookies.get("token");
        try{
            const {data} = await axios.get(`${user_service}/api/v1/user/all`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUsers(data);
        }catch(error){
            console.log(error);
        }
    }


    useEffect(()=>{
        fetchUser();
        fetchChats();
        fetchUsers();
    },[]);

    return(
        <AppContext.Provider value={{user, setUser, isAuth, setIsAuth, loading, logoutUser, fetchUsers, fetchChats, fetchMoreChats, chats, hasMoreChats, loadingMoreChats, users, setChats}}>
            {children}
            <Toaster/>
        </AppContext.Provider>
    )
}


export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);

    if(!context){
        throw new Error("use app data must be used within App Provider")
    }

    return context; 
}