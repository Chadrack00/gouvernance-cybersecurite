"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Server as ServerIcon, ShieldAlert, FileText, Activity, Search, Loader2 } from "lucide-react"
import { createServer, updateServer, deleteServer, createLog, deleteLog, createAttack, deleteAttack, ServerItem, LogItem, AttackItem } from "@/actions/management.actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export default function ManagementTabs({ initialServers, initialLogs, initialAttacks, role }: { initialServers: ServerItem[], initialLogs: LogItem[], initialAttacks: AttackItem[], role: string | null }) {
  const [activeTab, setActiveTab] = useState("servers")

  return (
    <Tabs defaultValue="servers" className="space-y-4" onValueChange={setActiveTab}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="servers" className="flex items-center gap-2">
            <ServerIcon className="h-4 w-4" />
            Serveurs
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="attacks" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Attaques
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="servers">
        <ServerSection servers={initialServers} role={role} />
      </TabsContent>

      <TabsContent value="logs">
        <LogSection logs={initialLogs} role={role} />
      </TabsContent>

      <TabsContent value="attacks">
        <AttackSection attacks={initialAttacks} role={role} servers={initialServers} />
      </TabsContent>

      <TabsContent value="overview">
        <OverviewSection servers={initialServers} logs={initialLogs} attacks={initialAttacks} />
      </TabsContent>
    </Tabs>
  )
}

function ServerSection({ servers, role }: { servers: ServerItem[], role: string | null }) {
  const canModify = role === "ADMIN"
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<ServerItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      ip_adresse: formData.get("ip_adresse") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
    }

    setIsLoading(true)
    try {
      if (editingServer) {
        await updateServer(editingServer.id_serveur, data)
        toast.success("Serveur mis à jour")
      } else {
        await createServer(data)
        toast.success("Serveur créé")
      }
      setIsCreateOpen(false)
      setEditingServer(null)
      router.refresh()
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce serveur ?")) {
      setIsDeleting(id)
      try {
        await deleteServer(id)
        toast.success("Serveur supprimé")
        router.refresh()
      } catch (error) {
        toast.error("Erreur lors de la suppression")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Serveurs</CardTitle>
          <CardDescription>Ajoutez, modifiez ou supprimez vos serveurs réseau.</CardDescription>
        </div>
        {canModify && (
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setEditingServer(null); }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter un serveur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingServer ? "Modifier le serveur" : "Ajouter un serveur"}</DialogTitle>
                <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du serveur</label>
                  <Input name="name" defaultValue={editingServer?.name} required placeholder="ex: Web-Server-01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Input name="type" defaultValue={editingServer?.type} required placeholder="ex: Application" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse IP</label>
                  <Input name="ip_adresse" defaultValue={editingServer?.ip_adresse} required placeholder="ex: 192.168.1.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select name="status" defaultValue={editingServer?.status || "ACTIVE"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" defaultValue={editingServer?.description ?? ""} placeholder="Optionnel" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingServer ? "Mettre à jour" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              {canModify && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id_serveur}>
                <TableCell className="font-medium">{server.name}</TableCell>
                <TableCell>{server.ip_adresse}</TableCell>
                <TableCell>{server.type}</TableCell>
                <TableCell>
                  <Badge variant={server.status === "ACTIVE" ? "default" : server.status === "MAINTENANCE" ? "secondary" : "destructive"}>
                    {server.status}
                  </Badge>
                </TableCell>
                {canModify && (
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingServer(server); setIsCreateOpen(true); }}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(server.id_serveur)} disabled={isDeleting === server.id_serveur}>
                      {isDeleting === server.id_serveur ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function LogSection({ logs, role }: { logs: LogItem[], role: string | null }) {
  const canModify = role === "ADMIN" || role === "ANALYST"
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsLoading(true)
    try {
      const content = JSON.parse(formData.get("content") as string)
      await createLog({ content })
      toast.success("Log ajouté")
      setIsCreateOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Format JSON invalide")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteLog(id)
      toast.success("Log supprimé")
      router.refresh()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Logs Système</CardTitle>
          <CardDescription>Consultez et gérez les traces d&apos;activité.</CardDescription>
        </div>
        {canModify && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Simuler un log
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Log</DialogTitle>
                <DialogDescription>Entrez le contenu au format JSON.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contenu (JSON)</label>
                  <Textarea name="content" rows={10} placeholder='{"event": "login", "user": "admin", "status": "success"}' required />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Contenu</TableHead>
              {canModify && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id_log}>
                <TableCell className="whitespace-nowrap">{format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell className="font-mono text-xs max-w-md truncate">
                  {JSON.stringify(log.content)}
                </TableCell>
                {canModify && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id_log)} disabled={isDeleting === log.id_log}>
                      {isDeleting === log.id_log ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function AttackSection({ attacks, role, servers }: { attacks: AttackItem[], role: string | null, servers: ServerItem[] }) {
  const canModify = role === "ADMIN" || role === "ANALYST"
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsLoading(true)
    try {
      await createAttack({
        type: formData.get("type") as string,
        status: formData.get("status") as string,
        id_server: formData.get("id_server") as string,
        data: JSON.parse(formData.get("data") as string),
      })
      toast.success("Attaque enregistrée")
      setIsCreateOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Erreur dans les données JSON")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteAttack(id)
      toast.success("Attaque supprimée")
      router.refresh()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Attaques</CardTitle>
          <CardDescription>Enregistrez les tentatives d&apos;intrusion détectées.</CardDescription>
        </div>
        {canModify && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Signaler une attaque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Signaler une Attaque</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type d&apos;attaque</label>
                  <Input name="type" placeholder="ex: Brute Force, DDoS" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select name="status" defaultValue="FAILED">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUCCESSFUL">Réussie</SelectItem>
                      <SelectItem value="FAILED">Échouée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Serveur cible</label>
                  <Select name="id_server" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le serveur" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server.id_serveur} value={server.id_serveur}>
                          {server.name} ({server.ip_adresse})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Détails (JSON)</label>
                  <Textarea name="data" placeholder='{"origin_ip": "10.0.0.5", "target": "DB"}' required />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              {canModify && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attacks.map((attack) => (
              <TableRow key={attack.id_attaque}>
                <TableCell className="font-medium">{attack.type}</TableCell>
                <TableCell>{format(new Date(attack.created_at), "dd/MM HH:mm")}</TableCell>
                <TableCell>
                  <Badge variant={attack.status === "SUCCESSFUL" ? "destructive" : "secondary"}>
                    {attack.status}
                  </Badge>
                </TableCell>
                {canModify && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(attack.id_attaque)} disabled={isDeleting === attack.id_attaque}>
                      {isDeleting === attack.id_attaque ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function OverviewSection({ servers, logs, attacks }: { servers: ServerItem[], logs: LogItem[], attacks: AttackItem[] }) {
  const activeServers = servers.filter(s => s.status === "ACTIVE").length
  const failedAttacks = attacks.filter(a => a.status === "FAILED").length
  const totalEvents = logs.length + attacks.length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Serveurs Actifs</CardTitle>
          <ServerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeServers} / {servers.length}</div>
          <p className="text-xs text-muted-foreground">Disponibilité globale</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attaques Bloquées</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{failedAttacks}</div>
          <p className="text-xs text-muted-foreground">Tentatives neutralisées</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Événements Totaux</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <p className="text-xs text-muted-foreground">Activité enregistrée</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Santé Système</CardTitle>
          <Activity className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Optimale</div>
          <p className="text-xs text-muted-foreground">Dernier scan: il y a 5 min</p>
        </CardContent>
      </Card>
    </div>
  )
}
