"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import Link from 'next/link';
import {
  BarChart,
  Bell,
  Clock,
  Home,
  LineChart,
  PlusCircle,
  Search,
  ShieldAlert,
  TriangleAlert,
  Users,
  User,
} from "lucide-react";
import { getIncidents, addIncident } from "@/lib/data";
import { type Incident, type IncidentPriority, type IncidentStatus } from "@/lib/types";
import { MetricCard } from "@/components/dashboard/metric-card";
import { IncidentTable } from "@/components/dashboard/incident-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getWeeklySummary, getMonthlySummary } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


const priorities: IncidentPriority[] = ["Crítica", "Alta", "Media", "Baja"];
const statuses: IncidentStatus[] = ["Abierto", "En espera", "Cerrado"];
const environments = ["Producción", "Contingencia"];

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<IncidentPriority | "all">("all");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [environment, setEnvironment] = useState<string>("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Form state for new incident
  const [newIncidentService, setNewIncidentService] = useState("");
  const [newIncidentDescription, setNewIncidentDescription] = useState("");
  const [newIncidentPriority, setNewIncidentPriority] = useState<IncidentPriority>("Media");
  const [newIncidentEnvironment, setNewIncidentEnvironment] = useState("Producción");
  const [newIncidentStartTime, setNewIncidentStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [newIncidentSessionLink, setNewIncidentSessionLink] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadIncidents() {
      const fetchedIncidents = await getIncidents();
      setIncidents(fetchedIncidents);
    }
    loadIncidents();
  }, []);


  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      return (
        (search === "" || incident.service.toLowerCase().includes(search.toLowerCase())) &&
        (priority === "all" || incident.priority === priority) &&
        (status === "all" || incident.status === status) &&
        (environment === "all" || incident.environment === environment)
      );
    });
  }, [search, priority, status, environment, incidents]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredIncidents, currentPage]);

  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);


  const metrics = useMemo(() => {
    const totalIncidents = filteredIncidents.length;
    // Dummy calculations for metrics
    const avgResponseTime = totalIncidents > 0 ? "35m" : "N/A";
    const avgResolutionTime = totalIncidents > 0 ? "4h 15m" : "N/A";
    const incidentRate = totalIncidents > 0 ? "1.2/día" : "N/A";
    return { totalIncidents, avgResponseTime, avgResolutionTime, incidentRate };
  }, [filteredIncidents]);
  
  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIncidentData = {
      service: newIncidentService,
      startTime: new Date(newIncidentStartTime).toISOString(),
      description: newIncidentDescription,
      priority: newIncidentPriority,
      environment: newIncidentEnvironment,
      sessionLink: newIncidentSessionLink,
    };
    const newIncident = await addIncident(newIncidentData);
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
    setCreateModalOpen(false);
    // Reset form
    setNewIncidentService("");
    setNewIncidentDescription("");
    setNewIncidentPriority("Media");
    setNewIncidentEnvironment("Producción");
    setNewIncidentStartTime(new Date().toISOString().slice(0, 16));
    setNewIncidentSessionLink("");

    toast({
      title: "Incidente Creado",
      description: "El nuevo incidente ha sido creado exitosamente.",
    });
  };

  return (
    <TooltipProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]">
        <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center justify-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
                <ShieldAlert className="h-6 w-6" />
                <span className="sr-only">Gestión de Incidentes</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="#"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground transition-colors hover:text-sidebar-primary-foreground md:h-8 md:w-8"
                    >
                      <Home className="h-5 w-5" />
                      <span className="sr-only">Panel</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Panel</TooltipContent>
                </Tooltip>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="#"
                      className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:text-sidebar-primary-foreground md:h-8 md:w-8"
                    >
                      <Users className="h-5 w-5" />
                      <span className="sr-only">Usuarios</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Usuarios</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="#"
                      className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:text-sidebar-primary-foreground md:h-8 md:w-8"
                    >
                      <LineChart className="h-5 w-5" />
                      <span className="sr-only">Analíticas</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Analíticas</TooltipContent>
                </Tooltip>
              </nav>
            </div>
            <div className="mt-auto p-4 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent cursor-pointer">
                    <User className="h-5 w-5 text-sidebar-accent-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-bold">Juan Pérez</p>
                  <p className="text-sm">Ingeniero de Confiabilidad</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <h1 className="text-xl font-bold tracking-tight">Gestión de Incidentes</h1>
            <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Alternar notificaciones</span>
            </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Incidente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateIncident}>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Incidente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service" className="text-right">
                          Servicio
                        </Label>
                        <Input
                          id="service"
                          value={newIncidentService}
                          onChange={(e) => setNewIncidentService(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="description"
                          value={newIncidentDescription}
                          onChange={(e) => setNewIncidentDescription(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">
                          Hora de inicio
                        </Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newIncidentStartTime}
                          onChange={(e) => setNewIncidentStartTime(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Prioridad
                        </Label>
                         <Select onValueChange={(value) => setNewIncidentPriority(value as IncidentPriority)} defaultValue={newIncidentPriority}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="environment" className="text-right">
                          Ambiente
                        </Label>
                        <Select onValueChange={(value) => setNewIncidentEnvironment(value)} defaultValue={newIncidentEnvironment}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar ambiente" />
                          </SelectTrigger>
                          <SelectContent>
                            {environments.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sessionLink" className="text-right">
                          Link de Sesión
                        </Label>
                        <Input
                          id="sessionLink"
                          value={newIncidentSessionLink}
                          onChange={(e) => setNewIncidentSessionLink(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">Crear</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Card>
              <CardHeader>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <MetricCard title="Incidentes Totales" value={metrics.totalIncidents} icon={BarChart} />
                    <MetricCard title="Tiempo Prom. Respuesta" value={metrics.avgResponseTime} icon={Clock} />
                    <MetricCard title="Tiempo Prom. Resolución" value={metrics.avgResolutionTime} icon={ShieldAlert} />
                    <MetricCard title="Tasa General de Incidentes" value={metrics.incidentRate} icon={TriangleAlert} />
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 rounded-lg md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por servicio..."
                      className="w-full rounded-lg bg-background pl-8"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:flex md:flex-row md:grid-cols-3">
                    <Select value={priority} onValueChange={(value) => {
                        setPriority(value as IncidentPriority | "all");
                        setCurrentPage(1);
                      }}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las Prioridades</SelectItem>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(value) => {
                        setStatus(value as IncidentStatus | "all");
                        setCurrentPage(1);
                      }}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={environment} onValueChange={(value) => {
                      setEnvironment(value as "all" | string);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos los Ambientes</SelectItem>
                          {environments.map((e) => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <IncidentTable incidents={paginatedIncidents} />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
