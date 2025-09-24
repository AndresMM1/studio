"use client";

import { useState, useMemo, useEffect } from "react";
import Link from 'next/link';
import {
  BarChart,
  Clock,
  Home,
  LineChart,
  Loader2,
  PlusCircle,
  Search,
  AlertOctagon,
  GitPullRequestIcon,
  Cog,
  ShieldAlert,
  TriangleAlert,
  Users,
  User,
} from "lucide-react";
import { getIncidents, addIncident, getServices } from "@/lib/data";
import { type Incident, type IncidentPriority, type IncidentStatus, type Service } from "@/lib/types";
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
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";


const priorities: IncidentPriority[] = ["Crítica", "Alta", "Media", "Baja"];
const statuses: IncidentStatus[] = ["Proceso", "En espera", "Cerrado", "Cerrada"];
const environments = ["Producción", "Contingencia"];

const ITEMS_PER_PAGE = 10;

function DashboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<IncidentPriority | "all">("all");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [environment, setEnvironment] = useState<string>("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Form state for new incident
  const [newIncidentService, setNewIncidentService] = useState<string | undefined>(undefined);
  const [newIncidentDescription, setNewIncidentDescription] = useState("");
  const [newIncidentPriority, setNewIncidentPriority] = useState<IncidentPriority>("Media");
  const [newIncidentEnvironment, setNewIncidentEnvironment] = useState("Producción");
  const [newIncidentStartTime, setNewIncidentStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      const [fetchedIncidents, fetchedServices] = await Promise.all([
        getIncidents(),
        getServices(),
      ]);
      setIncidents(fetchedIncidents);
      setServices(fetchedServices);
      setIsLoading(false);
    }
    loadInitialData();
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
    if (!newIncidentService) {
        toast({
            title: "Error de validación",
            description: "Por favor, selecciona un servicio.",
            variant: "destructive"
        });
        return;
    }
    if (!user) {
       toast({
            title: "Error de autenticación",
            description: "No has iniciado sesión.",
            variant: "destructive"
        });
        return;
    }
    try {
        const newIncidentData: Omit<Incident, 'id' | 'status' | 'endDate'> = {
          service: newIncidentService,
          startTime: new Date(newIncidentStartTime).toISOString(),
          description: newIncidentDescription,
          priority: newIncidentPriority,
          environment: newIncidentEnvironment,
        };
        const newIncident = await addIncident(newIncidentData, user.email);
        setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
        setCreateModalOpen(false);
        // Reset form
        setNewIncidentService(undefined);
        setNewIncidentDescription("");
        setNewIncidentPriority("Media");
        setNewIncidentEnvironment("Producción");
        setNewIncidentStartTime(new Date().toISOString().slice(0, 16));

        toast({
          title: "Incidente Creado",
          description: "El nuevo incidente ha sido creado exitosamente.",
        });
    } catch (error) {
        toast({
            title: "Error al crear el incidente",
            description: "No se pudo crear el incidente. Por favor, inténtelo de nuevo.",
            variant: "destructive"
        })
    }
  };

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]">
          <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center justify-center  border-sidebar-border lg:h-[60px] px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
                  <img src="https://www.goupayments.com.co/o/theme-gou/images/favicon.ico" className="h-8 w-8" />
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
                        <AlertOctagon className="h-5 w-5" />
                        <span className="sr-only">Incidentes</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Incidentes</TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="#"
                        className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:text-sidebar-primary-foreground md:h-8 md:w-8"
                      >
                        <GitPullRequestIcon className="h-5 w-5" />
                        <span className="sr-only">Cambios</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Cambios</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="#"
                        className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:text-sidebar-primary-foreground md:h-8 md:w-8"
                      >
                        <Cog className="h-5 w-5" />
                        <span className="sr-only">Toil</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Toil</TooltipContent>
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
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-sm">{user?.email}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4  bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              <h1 className="text-xl font-bold tracking-tight">Gestión de Incidentes</h1>
              <div className="ml-auto flex items-center gap-4">
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
                          <Select onValueChange={(value) => setNewIncidentService(value)} value={newIncidentService}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((s) => <SelectItem key={s.ID} value={s.SERVICE_NAME}>{s.SERVICE_NAME}</SelectItem>)}
                            </SelectContent>
                          </Select>
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
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>

            </main>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
}

export default DashboardPage;
