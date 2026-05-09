import { Suspense } from "react";
import ChatContainer from "@/components/chat/chat-container";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Discussion Globale",
  description: "Espace de discussion pour tous les utilisateurs",
};

function ChatSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-[calc(100vh-12rem)] w-full rounded-xl" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Espace de discussion</h1>
      </div>
      
      <Suspense fallback={<ChatSkeleton />}>
        <ChatContainer />
      </Suspense>
    </div>
  );
}
