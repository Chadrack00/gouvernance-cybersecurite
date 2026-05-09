"use client"

import { AttackSimulator } from "@/components/dashboard/attack-simulator"
import { Terminal, ShieldAlert, Zap, Skull, Radio, Lock } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function HackerPage() {
  return (
    <div className="min-h-screen bg-[#050000] text-red-600 font-mono p-4 md:p-12 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 opacity-5 animate-pulse bg-red-900 pointer-events-none"></div>

      <div className="z-10 w-full max-w-5xl space-y-12">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-6 mb-2">
            <Skull className="h-20 w-20 animate-bounce text-red-700" />
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic shadow-red-500/50 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
              OFFENSIVE <span className="text-white">NODE</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-red-500 text-sm md:text-base">
            <Radio className="h-4 w-4 animate-ping" />
            <span>ENCRYPTED CONNECTION ESTABLISHED // TARGET: CLOUD_INFRA_01</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-black/80 border-2 border-red-900/50 p-6 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-infinite-scroll"></div>
              <div className="flex items-center gap-3 mb-4 border-b border-red-900/30 pb-2 text-red-400">
                <Terminal className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Payload Terminal</span>
              </div>
              <div className="space-y-1 text-sm md:text-base">
                <p className="text-red-900">$ whoami</p>
                <p className="text-white">root@offensive-node</p>
                <p className="text-red-900">$ nmap -sS -O -T4 10.0.4.22</p>
                <p className="text-red-500">Scanning target... [88% COMPLETED]</p>
                <p className="text-red-500 italic animate-pulse">Vulnerability found: CVE-2024-X99 (Buffer Overflow)</p>
                <p className="text-red-900">$ generate --payload=ransomware.exe --distribute</p>
                <p className="text-white font-bold tracking-[0.2em] bg-red-950 px-2 mt-4 inline-block">SYSTEM BREACH READY</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Zap className="h-4 w-4" />} label="STRENGTH" value="99.9%" color="text-red-500" />
              <StatCard icon={<Lock className="h-4 w-4" />} label="ENCRYPTION" value="AES-256" color="text-white" />
            </div>
          </div>

          <aside className="space-y-6 flex flex-col justify-between">
            <div className="bg-red-950/20 border-2 border-red-600 p-8 flex flex-col items-center justify-center text-center space-y-6 relative group hover:bg-red-600/10 transition-colors">
              <div className="absolute -top-3 -left-3 bg-red-600 text-black px-2 py-1 text-[10px] font-black italic">DANGER</div>
              <ShieldAlert className="h-16 w-16 text-red-600 animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase italic">Final Strike</h3>
                <p className="text-xs text-red-400">Launch a coordinated multi-vector attack against the main governance cluster.</p>
              </div>
              
              <Suspense fallback={<Skeleton className="h-20 w-full bg-red-900/50" />}>
                <AttackSimulator variant="hacker" />
              </Suspense>
            </div>

            <div className="text-[10px] text-red-900 uppercase tracking-tighter text-center italic">
              Warning: Unauthorized access is prohibited. <br />
              All actions are being recorded on the blockchain.
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes infinite-scroll {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 2s linear infinite;
        }
      `}</style>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-black border border-red-900/30 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-red-700">{icon}</span>
        <span className="text-[10px] text-red-900 font-bold uppercase">{label}</span>
      </div>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  )
}
