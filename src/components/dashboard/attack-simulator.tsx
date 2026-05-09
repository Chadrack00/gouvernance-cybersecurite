"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Loader2, Zap } from "lucide-react"
import { simulateAttack } from "@/actions/management.actions"
import { toast } from "sonner"

export function AttackSimulator({ variant = "default" }: { variant?: "default" | "hacker" }) {
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = async () => {
    setIsSimulating(true)
    try {
      const result = await simulateAttack()
      toast.success(`Simulation réussie : ${result.type} (${result.status})`)
    } catch (error) {
      toast.error("Erreur lors de la simulation")
    } finally {
      setIsSimulating(false)
    }
  }

  if (variant === "hacker") {
    return (
      <Button 
        onClick={handleSimulate} 
        disabled={isSimulating}
        className="bg-red-600 hover:bg-red-700 text-white font-mono text-xl py-8 px-12 rounded-none border-2 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all active:scale-95"
      >
        {isSimulating ? (
          <Loader2 className="mr-4 h-8 w-8 animate-spin" />
        ) : (
          <Zap className="mr-4 h-8 w-8 fill-current" />
        )}
        EXECUTE ATTACK
      </Button>
    )
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleSimulate} 
      disabled={isSimulating}
      className="flex items-center gap-2"
    >
      {isSimulating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldAlert className="h-4 w-4" />
      )}
      Simuler une cyber-attaque
    </Button>
  )
}
