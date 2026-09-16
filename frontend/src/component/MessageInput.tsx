import { Loader2, Paperclip, Send, X } from 'lucide-react';
import React, { useState } from 'react'

interface MessageInputProps{
    selectedUser: string | null;
    message: string;
    setMessage: (message: string) => void;
    handleMessageSend: (e:any, imageFile?:File | null) => void
}

const MessageInput = ({selectedUser, message, setMessage, handleMessageSend}: MessageInputProps) => {

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleSubmit = async(e:any) => {
        e.preventDefault()
        if(!message.trim() && !imageFile) return

        setIsUploading(true)
        await handleMessageSend(e, imageFile)
        setImageFile(null)
        setIsUploading(false);
    };

    if(!selectedUser) return null;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-line pt-2">
            {
                imageFile && <div className="relative w-fit">
                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-24 h-24 object-cover rounded-lg border border-line"/>
                    <button type="button" className="absolute -top-2 -right-2 bg-black rounded-full p-1" onClick={()=>setImageFile(null)}>
                        <X className="w-4 h-4 text-text-primary"/>
                    </button>
                </div>
            }
            <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-card hover:bg-card-hover rounded-lg px-3 py-2 transition-colors">
                    <Paperclip size={18} className="text-text-secondary"/>
                    <input type="file" accept="image/*" className="hidden" onChange={e=>{
                        const file = e.target.files?.[0]
                        if(file && file.type.startsWith("image/")) {
                            setImageFile(file)
                        }
                    }}/>
                </label>

                <input
                    type="text"
                    className="flex-1 bg-card rounded-lg px-4 py-2 text-text-primary placeholder-text-muted"
                    placeholder={imageFile ? "Add a caption..." : "Type a message..."}
                    value={message}
                    onChange={(e)=> setMessage(e.target.value)}    
                />

                <button type="submit" disabled={(!imageFile && !message) || isUploading}
                    className="bg-accent hover:bg-accent-hover px-4 py-2 rounded-lg transition-colors flex items-center gap-1
                    disabled:opacity-50 disabled:cursor-not-allowed text-text-primary">
                        {
                            isUploading ? <Loader2 className="w-4 h-4 animate-spin"/>: <Send className="w-4 h-4"/>
                        }
                </button>
            </div>
        
        </form>
    )
}

export default MessageInput
