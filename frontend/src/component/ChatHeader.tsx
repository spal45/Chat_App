import { User } from '@/context/AppContext';
import { Menu, UserCircle } from 'lucide-react'
import React from 'react'

interface ChatHeaderProps {
    user: User | null;
    setSidebarOpen: (open: boolean) => void;
    isTyping: boolean;
    onlineUsers: string[];
}

const ChatHeader = ({ user, setSidebarOpen, isTyping, onlineUsers }: ChatHeaderProps) => {
    const isOnlineUser = user && onlineUsers.includes(user._id)
    return (
        <>
            {/* Mobile menu toggle */}
            <div className="sm:hidden fixed top-4 right-4 z-30">
                <button className="p-3 bg-panel  rounded-lg hover:bg-card transition-colors" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5 text-text-secondary" />

                </button>

            </div>

            {/*Chat Header */}
            <div className="mb-6 bg-panel rounded-lg border border-line p-6">
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                                    <UserCircle className="w-8 h-8 text-text-secondary" />
                                </div>
                                {/* Online indicator */}
                                {
                                    isOnlineUser && (
                                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-panel">
                                            <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75">

                                            </span>
                                        </span>
                                    )
                                }
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-text-primary truncate">
                                        {user.name}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {
                                        isTyping ? <div className="flex items-center gap-2 text-sm">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce">

                                                </div>
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "100ms" }}>

                                                </div>
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "200ms" }}>

                                                </div>
                                            </div>
                                            <span className="text-accent-soft font-medium">typing...</span>
                                        </div> : <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isOnlineUser ? "bg-success" : "bg-text-muted"}`}></div>
                                            <span className="text-sm font-medium text-text-secondary">
                                                {isOnlineUser ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                                <UserCircle className="w-8 h-8 text-text-secondary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-text-muted">
                                    Select a conversation
                                </h2>
                                <p className="text-sm text-text-muted mt-1">
                                    Choose a chat from the sidebar to start messaging.
                                </p>
                            </div>
                        </div>)}

                </div>
            </div>
        </>
    )
}

export default ChatHeader
