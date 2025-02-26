import { ChatContainer } from "@/components/chat/chat-container";

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">AIチャット</h1>
      <ChatContainer />
    </div>
  );
}
