"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

interface Conversation {
  id: string;
  participant1: { id: string; displayName: string; profileImage: string | null; username: string };
  participant2: { id: string; displayName: string; profileImage: string | null; username: string };
  messages: { content: string; createdAt: string; senderId: string }[];
}

interface FullMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export default function MessagesClient({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[];
  currentUserId: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [message, setMessage] = useState("");
  const [fullMessages, setFullMessages] = useState<FullMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOtherUser = (conv: Conversation) =>
    conv.participant1.id === currentUserId ? conv.participant2 : conv.participant1;

  const selectedConv = conversations.find((c) => c.id === selected);

  const fetchMessages = async (conversationId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setFullMessages(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (selected) {
      fetchMessages(selected);
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fullMessages]);

  const handleSend = async () => {
    if (!message.trim() || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selected, content: message.trim() }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setFullMessages((prev) => [...prev, newMsg]);
        setMessage("");
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold tracking-tight mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p className="text-[15px] font-medium text-zinc-400">No conversations yet</p>
          <p className="text-[13px] text-zinc-600 mt-1">Start a conversation from a producer&apos;s page</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[280px_1fr] gap-0 min-h-[500px] rounded-xl overflow-hidden bg-zinc-950">
          <div className="border-r border-white/[0.06] overflow-y-auto">
            {conversations.map((conv) => {
              const other = getOtherUser(conv);
              const lastMsg = conv.messages[0];
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selected === conv.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-[13px] font-medium">
                    {other.displayName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate">{other.displayName}</p>
                    {lastMsg && (
                      <p className="text-[11px] text-zinc-500 truncate">{lastMsg.content}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col">
            {selectedConv ? (
              <>
                <div className="border-b border-white/[0.06] px-5 py-3">
                  <p className="text-[13px] font-medium">{getOtherUser(selectedConv).displayName}</p>
                  <p className="text-[11px] text-zinc-500">@{getOtherUser(selectedConv).username}</p>
                </div>

                <div className="flex-1 space-y-2 p-5 overflow-y-auto">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                    </div>
                  ) : (
                    fullMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-[13px] ${
                            msg.senderId === currentUserId
                              ? "bg-white text-black rounded-br-md"
                              : "bg-zinc-800 text-white rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex items-center gap-2 p-4 border-t border-white/[0.06]">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-white/[0.07] rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-white/20 border-0"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 shrink-0 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600 text-[13px]">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
