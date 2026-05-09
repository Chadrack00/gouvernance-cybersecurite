import { getChatMessages, getCurrentUserProfile } from "@/actions/chat.actions";
import ChatClient from "./chat-client";

export default async function ChatContainer() {
  const initialMessages = await getChatMessages();
  const currentProfile = await getCurrentUserProfile();

  return (
    <ChatClient 
      initialMessages={initialMessages} 
      currentProfile={currentProfile} 
    />
  );
}
