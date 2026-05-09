"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/actions/supabase/client"
import { sendChatMessage } from "@/actions/chat.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export interface Message {
  id: string
  message: string
  created_at: string
  sender_id: string
  sender_name: string
  sender_photo: string
}

export default function ChatClient({ 
  initialMessages, 
  currentProfile 
}: { 
  initialMessages: Message[]
  currentProfile: { id_profile: string, name: string | null, photo: string | null } | null
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        async (payload) => {
          // Fetch id_user from profiles first
          const { data: p } = await supabase
            .from("profiles")
            .select("id_user")
            .eq("id_profile", payload.new.sender_id)
            .single()

          if (!p) return;

          // Then fetch name from users_profiles view
          const { data: profile } = await supabase
            .from("users_profiles")
            .select("name, photo")
            .eq("id", p.id_user)
            .single()

          const newMessage: Message = {
            id: payload.new.id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            sender_id: payload.new.sender_id,
            sender_name: profile?.name || "Anonyme",
            sender_photo: profile?.photo || ""
          }

          // Avoid duplicate messages (if the sender also adds it optimistically or via re-render)
          setMessages((prev) => {
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    const currentInput = input.trim()
    setInput("") // Clear input immediately for better UX
    
    try {
      await sendChatMessage(currentInput)
    } catch (error) {
      console.error("Failed to send message:", error)
      setInput(currentInput) // Restore input on failure
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Discussion Globale</h2>
          <p className="text-xs text-muted-foreground">Tous les utilisateurs peuvent voir vos messages</p>
        </div>
        <div className="text-right">
            <span className="text-xs text-primary font-medium">Connecté en tant que {currentProfile?.name}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentProfile?.id_profile
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 mt-1 shadow-sm">
                  <AvatarImage src={msg.sender_photo} alt={msg.sender_name} />
                  <AvatarFallback className="bg-muted text-[10px]">
                    {msg.sender_name ? msg.sender_name.substring(0, 2).toUpperCase() : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {isMe ? "Moi" : (msg.sender_name || "Utilisateur")}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(new Date(msg.created_at), "HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm transition-all hover:brightness-95 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t bg-muted/10 flex gap-2">
        <Input
          placeholder="Écrivez votre message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-background"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isSending} className="shrink-0">
          <SendIcon className="h-4 w-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </form>
    </div>
  )
}
