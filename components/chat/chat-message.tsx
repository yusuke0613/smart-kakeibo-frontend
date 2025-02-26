"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 max-w-[80%]",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/ai-avatar.png" alt="AI" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg p-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className="mt-1 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="User" />
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
