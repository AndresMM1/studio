"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { getIncidentById, getIncidentUpdates, addIncidentUpdate, updateIncidentStatus, sendClosureDocumentation } from "@/lib/data";
import { type Incident, type IncidentUpdate, type IncidentStatus, type IncidentPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  HardHat,
  ShieldAlert,
  TriangleAlert,
  AlertCircle,
  Info,
  Calendar,
  Briefcase,
  Layers,
  CalendarCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const priorityMap: Record<IncidentPriority, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Crítica": { icon: ShieldAlert, className: "text-red-500", badgeClassName: "bg-red-100 text-red-800" },
  "Alta": { icon: TriangleAlert, className: "text-orange-500", badgeClassName: "bg-orange-100 text-orange-800" },
  "Media": { icon: AlertCircle, className: "text-yellow-500", badgeClassName: "bg-yellow-100 text-yellow-800" },
  "Baja": { icon: Info, className: "text-blue-500", badgeClassName: "bg-blue-100 text-blue-800" },
};

const statusMap = {
  "Proceso": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800" },
  "En espera": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800" },
  "Cerrado": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
  "Cerrada": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5 segundos

const getGmt5DateString = () => {
    const now = new Date();
    // Adjust for GMT-5
    now.setHours(now.getHours() - 5);
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  // State for the close incident form
  const [solution, setSolution] = useState('');
  const [endTime, setEndTime] = useState(getGmt5DateString());
  const [generatedAlerts, setGeneratedAlerts] = useState(false);
  const [docResponsible, setDocResponsible] = useState('');
  const [domainResponsible, setDomainResponsible] = useState('');


  const fetchIncidentWithRetries = useCallback(async (id: number, retries: number) => {
    try {
      const fetchedIncident = await getIncidentById(id);
      if (fetchedIncident) {
        const fetchedUpdates = await getIncidentUpdates(id);
        setIncident(fetchedIncident);
        setUpdates(fetchedUpdates || []);
        setIsLoading(false);
        setError(null);
      } else if (retries > 0) {
        setTimeout(() => fetchIncidentWithRetries(id, retries - 1), RETRY_DELAY);
      } else {
        setError("El incidente que estás buscando no existe.");
        setIsLoading(false);
      }
    } catch (e) {
        setError("Ocurrió un error al cargar el incidente.");
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string, 10);
      if (!isNaN(id)) {
        setIsLoading(true);
        fetchIncidentWithRetries(id, MAX_RETRIES);
      } else {
        setError("ID de incidente no válido.");
        setIsLoading(false);
      }
    }
  }, [params.id, fetchIncidentWithRetries]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || newUpdate.trim() === "" || isSubmitting) return;

    setIsSubmitting(true);
    const createdUpdate = await addIncidentUpdate(incident.id.toString(), newUpdate);
    setUpdates(prevUpdates => [createdUpdate, ...prevUpdates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setNewUpdate("");
    setIsSubmitting(false);
  }
  
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if(!incident || isSubmitting) return;

    if (newStatus === "Cerrado") {
        setEndTime(getGmt5DateString());
        setIsCloseDialogOpen(true);
        return;
    }

    setIsSubmitting(true);
    const updateText = `Estado cambiado a ${newStatus}.`;
    
    const createdUpdate = await addIncidentUpdate(incident.id.toString(), updateText);
    setUpdates(prevUpdates => [createdUpdate, ...prevUpdates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    
    const updatedIncident = await updateIncidentStatus(incident.id, newStatus);
    if (updatedIncident) {
      setIncident(updatedIncident);
    }
    
    setIsSubmitting(false);
  }

  const handleCloseIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || isSubmitting) return;

    setIsSubmitting(true);

    try {
        const solutionUpdateText = `Solución aplicada : ${solution}`;
        
        // 1. Update status to "Cerrado"
        await updateIncidentStatus(incident.id, "Cerrado");

        // 2. Add final update and send documentation
        await Promise.all([
            addIncidentUpdate(incident.id.toString(), solutionUpdateText),
            sendClosureDocumentation({
                incidentId: incident.id,
                startTime: incident.startTime,
                endTime: endTime,
                service: incident.service,
                description: incident.description,
                solution: solution,
                generatedAlerts: generatedAlerts,
                docResponsible: docResponsible,
                domainResponsible: domainResponsible,
            })
        ]);

        // 3. Fetch final state
        const [fetchedUpdates, updatedIncident] = await Promise.all([
            getIncidentUpdates(incident.id),
            getIncidentById(incident.id)
        ]);
        
        setUpdates(fetchedUpdates || []);
        if (updatedIncident) {
          setIncident(updatedIncident);
        }

    } catch (error) {
        console.error("Error al cerrar el incidente:", error);
    } finally {
        // Reset form and close dialog
        setIsSubmitting(false);
        setIsCloseDialogOpen(false);
        setSolution('');
        setEndTime(getGmt5DateString());
        setGeneratedAlerts(false);
        setDocResponsible('');
        setDomainResponsible('');
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-24 w-24 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error || !incident) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Incidente no encontrado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error || "El incidente que estás buscando no existe."}</p>
                </CardContent>
                <CardFooter>
                     <Button asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Panel
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  const PriorityIcon = priorityMap[incident.priority].icon;
  const StatusIcon = statusMap[incident.status].icon;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <CardTitle className="text-xl font-bold whitespace-pre-wrap">{incident.service}: {incident.description}</CardTitle>
                <CardDescription className="mt-2 text-lg">
                    Incidente #{incident.id}
                </CardDescription>
            </div>
             <div className="flex gap-2">
                <Badge variant="outline" className={cn("border-0 text-base", priorityMap[incident.priority].badgeClassName)}>
                    <div className="flex items-center gap-2">
                        <PriorityIcon className={cn("h-5 w-5", priorityMap[incident.priority].className)} />
                        <span>{incident.priority}</span>
                    </div>
                </Badge>
                <Badge variant="outline" className={cn("border-0 text-base", statusMap[incident.status].badgeClassName)}>
                    <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-5 w-5", statusMap[incident.status].className)} />
                        <span>{incident.status}</span>
                    </div>
                </Badge>
             </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Inicio: {new Date(incident.startTime).toLocaleString()}</span>
                </div>
                 {incident.endDate && (
                     <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" />
                        <span>Fin: {new Date(incident.endDate).toLocaleString()}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{incident.service}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>{incident.environment}</span>
                </div>
            </div>
            
            <Separator className="my-6" />

            <div>
                <h3 className="text-xl font-semibold mb-4">Línea de tiempo de Avances</h3>
                <div className="space-y-4">
                    {updates.length > 0 ? (
                        updates.map((update) => (
                            <div key={update.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-primary rounded-full" />
                                    <div className="w-px h-full bg-border" />
                                </div>
                                <div>
                                    <p className="font-medium whitespace-pre-wrap">{update.text}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Aún no hay actualizaciones.</p>
                    )}
                </div>
            </div>

            <Separator className="my-6" />
            
            <form onSubmit={handleAddUpdate}>
                <h3 className="text-xl font-semibold mb-4">Agregar Actualización</h3>
                <Textarea 
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Proporcionar una actualización sobre el incidente..."
                    className="mb-4"
                    disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                       {incident.status !== 'En espera' && incident.status !== 'Cerrado' && incident.status !== 'Cerrada' && <Button onClick={() => handleStatusChange("En espera")} type="button" variant="outline" disabled={isSubmitting}>Poner en espera</Button>}
                       {(incident.status === 'En espera' || incident.status === 'Cerrado' || incident.status === 'Cerrada') && <Button onClick={() => handleStatusChange("Proceso")} type="button" variant="outline" disabled={isSubmitting}>Reabrir Incidente</Button>}
                       {incident.status !== 'Cerrado' && incident.status !== 'Cerrada' && (
                           <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                               <DialogTrigger asChild>
                                    <Button type="button" variant="destructive" disabled={isSubmitting}>Cerrar Incidente</Button>
                               </DialogTrigger>
                               <DialogContent className="sm:max-w-[425px]">
                                   <DialogHeader>
                                       <DialogTitle>Cerrar Incidente</DialogTitle>
                                       <DialogDescription>
                                           Proporcione los detalles finales para cerrar este incidente.
                                       </DialogDescription>
                                   </DialogHeader>
                                   <form onSubmit={handleCloseIncident}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="solution" className="text-right">Solución</Label>
                                            <Textarea id="solution" value={solution} onChange={e => setSolution(e.target.value)} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="endTime" className="text-right">Hora de Fin</Label>
                                            <Input id="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="col-span-3" required />
                                        </div>
                                         <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="alerts" className="text-right">¿Generó Alertas?</Label>
                                            <Switch id="alerts" checked={generatedAlerts} onCheckedChange={setGeneratedAlerts} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="docResponsible" className="text-right">Resp. Documentación</Label>
                                            <Input id="docResponsible" value={docResponsible} onChange={e => setDocResponsible(e.target.value)} className="col-span-3" required />
                                        </div>
                                         <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="domainResponsible" className="text-right">Resp. Dominio</Label>
                                            <Input id="domainResponsible" value={domainResponsible} onChange={e => setDomainResponsible(e.target.value)} className="col-span-3" required />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsCloseDialogOpen(false)}>Cancelar</Button>
                                        <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                            {isSubmitting ? 'Cerrando...' : 'Confirmar Cierre'}
                                        </Button>
                                    </DialogFooter>
                                   </form>
                               </DialogContent>
                           </Dialog>
                       )}
                    </div>
                     <Button type="submit" disabled={isSubmitting || newUpdate.trim() === ''}>
                        {isSubmitting ? "Enviando..." : "Agregar Actualización"}
                    </Button>
                </div>
            </form>

        </CardContent>
      </Card>
    </div>
  );
}
