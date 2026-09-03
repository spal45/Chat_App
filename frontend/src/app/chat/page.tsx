"use client"
import ChatSidebar from '@/component/ChatSidebar';
import Loading from '@/component/Loading';
import { useAppData, User } from '@/context/AppContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {
  const {
    loading, 
    isAuth, 
    logoutUser, 
    chats, 
    user: loggedInUser, 
    users, 
    fetchChats, 
    setChats
  } = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login")
    }
  },[isAuth, router, loading]);

  const handleLogout = () => logoutUser?.();

  async function createChat(u: User){

  }

  if(loading) return <Loading/>
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        showAllUsers={showAllUser} 
        setShowAllUsers={setShowAllUser} 
        users={users ?? null} 
        loggedInUser={loggedInUser} 
        chats={chats ?? null}
        selectedUser={selectedUser} 
        setSelectedUser={setSelectedUser} 
        handleLogout={handleLogout}
      />
      <div className="flex-1 flex-flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10">

      </div>
    </div>
  )
}

export default ChatApp
