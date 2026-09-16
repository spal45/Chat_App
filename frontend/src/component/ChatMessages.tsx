import { Message } from '@/app/chat/page';
import { User } from '@/context/AppContext';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import moment from 'moment'
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessagesProps{
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  hasMore?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
}

const ChatMessages = ({ selectedUser, messages, loggedInUser, hasMore, loadingOlder, onLoadOlder }: ChatMessagesProps) => {

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);
  // becomes true once the initial (instant) scroll-to-bottom has settled for the
  // current chat - guards against the smooth-scroll animation on chat-open
  // passing through the "near top" zone and spuriously triggering onLoadOlder
  const readyRef = useRef(false);

  //Seen feature
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      const messageId = message._id ?? message.id;
      if (!messageId || seen.has(messageId)) {
        return false;
      }
      seen.add(messageId);
      return true;
    })
  }, [messages]);

  useEffect(() => {
    readyRef.current = false;
  }, [selectedUser]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || !onLoadOlder || !hasMore || loadingOlder || !readyRef.current) return;

    if (el.scrollTop < 60) {
      prevScrollHeightRef.current = el.scrollHeight;
      isPrependingRef.current = true;
      onLoadOlder();
    }
  };

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !isPrependingRef.current) return;

    el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
  }, [uniqueMessages]);

  useEffect(() => {
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      return;
    }
    if (uniqueMessages.length === 0) return;

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: readyRef.current ? 'smooth' : 'auto' });
    }
    readyRef.current = true;
  }, [selectedUser, uniqueMessages]);
  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <div ref={scrollContainerRef} onScroll={handleScroll} className="h-full overflow-y-auto p-2 space-y-2 custom-scroll">
        {
          !selectedUser ? <p className="text-text-muted text-center mt-20">Select a conversation to start chatting.</p> :
          <>
          {loadingOlder && (
            <p className="text-text-muted text-xs text-center py-2">Loading older messages...</p>
          )}
          {
            uniqueMessages?.map((e,i) => {
              const isSentByMe = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id ?? e.id}-${i}`;

              return (
                <div className={`flex flex-col gap-1 mt-2 ${
                  isSentByMe ? 'items-end' : 'items-start'
                }`}
                key={uniqueKey}>
                  <div className={`rounded-lg p-3 max-w-sm ${isSentByMe ? 'bg-accent text-text-primary' : 'bg-card text-text-primary'}`}>
                    {
                      e.messageType === 'image' && e.image && (
                        <div className="relative group">
                          <img src={e.image.url} alt="Shared image" className="max-w-full h-auto rounded-lg" />
                        </div>
                      )
                    }
                    {e.text && <p className="mt-1">{e.text}</p>}
                  </div>

                  <div className={`flex items-center gap-1 text-xs text-text-muted ${
                    isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
                  }`}>
                    <span>
                      {moment(e.createdAt).format("hh:mm A . MMM D")}
                    </span>
                    {
                      isSentByMe && <div className="flex items-center ml-1">
                        {
                          e.seen ? <div className="flex items-center gap-1 text-accent-soft">
                            <CheckCheck className="w-3 h-3"/>
                            {
                              e.seenAt && <span>{moment(e.seenAt).format("hh:mm A")}</span>
                            }
                          </div>:<Check className="w-3 h-3 text-text-muted" />
                        }
                      </div>
                    }
                  </div>

                </div>
              )
            })
          }
          <div ref={bottomRef}></div>
          </>
        }

      </div>
      
    </div>
  )
}

export default ChatMessages
