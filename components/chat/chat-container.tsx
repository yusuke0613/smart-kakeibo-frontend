"use client";

import { useState } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "こんにちは！どのようにお手伝いできますか？",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // AIの応答をシミュレート（実際のAPIに置き換えることができます）
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `「${content}」についてのご質問ありがとうございます。お役に立てて嬉しいです。`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="animate-pulse">AIが応答を考えています...</div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
