"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { getIncidentById, getIncidentUpdates, addIncidentUpdate, updateIncidentStatus } from "@/lib/data";
import { type Incident, type IncidentUpdate, type IncidentStatus, type IncidentPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  "Abierto": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800" },
  "En espera": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800" },
  "Cerrado": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
  "Cerrada": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
};

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string, 10);
      async function loadData() {
        const [fetchedIncident, fetchedUpdates] = await Promise.all([
          getIncidentById(id),
          getIncidentUpdates(id)
        ]);
        setIncident(fetchedIncident || null);
        setUpdates(fetchedUpdates || []);
      }
      loadData();
    }
  }, [params.id]);

  if (!incident) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Incidente no encontrado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>El incidente que estás buscando no existe.</p>
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

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() === "" || isSubmitting) return;

    setIsSubmitting(true);
    const createdUpdate = await addIncidentUpdate(incident.id, newUpdate);
    setUpdates(prevUpdates => [...prevUpdates, createdUpdate]);
    setNewUpdate("");
    setIsSubmitting(false);
  }
  
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if(isSubmitting) return;

    setIsSubmitting(true);
    const updateText = `Estado cambiado a ${newStatus}.`;
    
    // Create the update first
    const createdUpdate = await addIncidentUpdate(incident.id, updateText);
    setUpdates(prevUpdates => [...prevUpdates, createdUpdate]);
    
    // Then update the incident status
    const updatedIncident = await updateIncidentStatus(incident.id, newStatus);
    if (updatedIncident) {
      setIncident(updatedIncident);
    }
    
    setIsSubmitting(false);
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
                <h3 className="text-xl font-semibold mb-4">Línea de tiempo del incidente</h3>
                <div className="space-y-4">
                    {updates.map((update, index) => (
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
                    ))}
                     {updates.length === 0 && (
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
                       {incident.status !== 'En espera' && <Button onClick={() => handleStatusChange("En espera")} type="button" variant="outline" disabled={isSubmitting}>Poner en espera</Button>}
                       {incident.status !== 'Abierto' && <Button onClick={() => handleStatusChange("Abierto")} type="button" variant="outline" disabled={isSubmitting}>Reabrir Incidente</Button>}
                       {incident.status !== 'Cerrado' && <Button onClick={() => handleStatusChange("Cerrado")} type="button" variant="destructive" disabled={isSubmitting}>Cerrar Incidente</Button>}
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
