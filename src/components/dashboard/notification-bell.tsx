"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/actions/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function NotificationBell() {
  const [hasNotification, setHasNotification] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "broadcast",
        { event: "new-profile" },
        (payload) => {
          console.log("New profile notification received:", payload)
          setHasNotification(true)
          toast.info("Un nouveau profil a été complété !")
        }
      )
      .on(
        "broadcast",
        { event: "new-attack" },
        (payload) => {
          console.log("New attack notification received:", payload)
          setHasNotification(true)
          toast.error(payload.payload.message || "ALERTE : Attaque détectée !")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleClick = () => {
    setHasNotification(false)
    router.push("/dashboard/accounts")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {hasNotification && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
    </div>
  )
}
