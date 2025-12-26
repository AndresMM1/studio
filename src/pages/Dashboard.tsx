import { useState, useMemo, useEffect } from "react";

import {
    BarChart,
    Clock,
    Server,
    Loader2,
    PlusCircle,
    Search,
    Link2,
    ChevronsUpDown,
    Check,
} from "lucide-react";
import { getIncidents, addIncident, getServices, generateTeamsMeetingLink, getDashboardStats } from "@/lib/data";
import { type Incident, type IncidentPriority, type IncidentStatus, type Service, type DashboardStats } from "@/lib/types";
import { IncidentTable } from "@/components/dashboard/incident-table";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";


const priorities: IncidentPriority[] = ["Crítica", "Alta", "Media", "Baja"];
const statuses: IncidentStatus[] = ["Proceso", "En espera", "Cerrado"];
const environments = ["Producción", "Contingencia"];

const ITEMS_PER_PAGE = 5;

// Helper function to get local date-time string in the correct format
const getLocalDateTimeString = () => {
    const now = new Date();
    // Adjust for timezone offset
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Return as ISO string slice
    return now.toISOString().slice(0, 16);
};

function DashboardPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [priority, setPriority] = useState<IncidentPriority | "all">("all");
    const [status, setStatus] = useState<IncidentStatus | "all">("all");
    const [environment, setEnvironment] = useState<string>("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isCreatingIncident, setIsCreatingIncident] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [isServiceComboboxOpen, setServiceComboboxOpen] = useState(false);
    const [serviceSearch, setServiceSearch] = useState("");

    // Form state for new incident
    const [newIncidentService, setNewIncidentService] = useState<string | undefined>(undefined);
    const [newIncidentDescription, setNewIncidentDescription] = useState("");
    const [newIncidentPriority, setNewIncidentPriority] = useState<IncidentPriority>("Media");
    const [newIncidentEnvironment, setNewIncidentEnvironment] = useState("Producción");
    const [newIncidentStartTime, setNewIncidentStartTime] = useState(getLocalDateTimeString());
    const [newIncidentTeamsLink, setNewIncidentTeamsLink] = useState("");
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadInitialData() {
            setIsLoading(true);
            try {
                const [fetchedIncidents, fetchedServices, fetchedStats] = await Promise.all([
                    getIncidents(),
                    getServices(),
                    getDashboardStats()
                ]);
                setIncidents(fetchedIncidents);
                setServices(fetchedServices);
                setStats(fetchedStats);
            } catch (error) {
                toast({
                    title: "Error al cargar datos",
                    description: "No se pudieron cargar los datos iniciales. Intente refrescar la página.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        loadInitialData();

        const intervalId = setInterval(async () => {
            try {
                const fetchedIncidents = await getIncidents();
                const fetchedStats = await getDashboardStats();
                setIncidents(fetchedIncidents);
                setStats(fetchedStats);
            } catch (error) {
                console.error("Failed to refresh incidents:", error);
                // Optionally, show a non-intrusive toast notification
            }
        }, 60000); // Refresh every 60 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [toast]);


    const filteredIncidents = useMemo(() => {
        return incidents.filter((incident) => {
            const searchTerm = search.toLowerCase();
            return (
                (search === "" ||
                    incident.service.toLowerCase().includes(searchTerm) ||
                    incident.description.toLowerCase().includes(searchTerm)) &&
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



    const handleCreateIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingIncident(true); // <-- Set loading state here
        if (!newIncidentService) {
            toast({
                title: "Error de validación",
                description: "Por favor, selecciona un servicio.",
                variant: "destructive"
            });
            setIsCreatingIncident(false);
            return;
        }
        if (!user) {
            toast({
                title: "Error de autenticación",
                description: "No has iniciado sesión.",
                variant: "destructive"
            });
            setIsCreatingIncident(false);
            return;
        }
        try {
            const newIncidentData: Omit<Incident, 'id' | 'status' | 'endDate'> = {
                service: newIncidentService,
                startTime: new Date(newIncidentStartTime).toISOString(),
                description: newIncidentDescription,
                priority: newIncidentPriority,
                environment: newIncidentEnvironment,
                teamsLink: newIncidentTeamsLink,
            };
            const newIncident = await addIncident(newIncidentData, user.email);
            setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
            setCreateModalOpen(false);
            // Reset form
            setNewIncidentService(undefined);
            setNewIncidentDescription("");
            setNewIncidentPriority("Media");
            setNewIncidentEnvironment("Producción");
            setNewIncidentStartTime(getLocalDateTimeString());
            setNewIncidentTeamsLink("");

            // Reset filters to show the new incident
            setSearch("");
            setPriority("all");
            setStatus("all");
            setEnvironment("all");
            setCurrentPage(1);

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
        } finally {
            setIsCreatingIncident(false);
        }
    };

    const handleGenerateLink = async () => {
        if (!newIncidentService) {
            toast({
                title: "Servicio no seleccionado",
                description: "Por favor, seleccione un servicio antes de generar el link.",
                variant: "destructive",
            });
            return;
        }
        setIsGeneratingLink(true);
        try {
            const link = await generateTeamsMeetingLink(newIncidentService);
            setNewIncidentTeamsLink(link);
            toast({
                title: "Link de Teams Generado",
                description: "El link se ha copiado en el campo correspondiente.",
            });
        } catch (error) {
            toast({
                title: "Error al generar el link",
                description: "No se pudo crear el link de la reunión. Por favor, créelo manualmente.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingLink(false);
        }
    };

    return (
        <ProtectedRoute>
            <TooltipProvider>
                <div className="flex flex-col min-h-screen w-full">
                    <header className="flex h-14 items-center gap-4 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                        <h1 className="text-xl font-bold tracking-tight">Gestión de Incidentes</h1>
                        <div className="ml-auto flex items-center gap-4">
                            <Sheet open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SheetTrigger asChild>
                                            <Button className="rounded-full">
                                                <PlusCircle className="h-4 w-4" />
                                            </Button>
                                        </SheetTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-md">Crear Incidente</p>
                                    </TooltipContent>
                                </Tooltip>
                                <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
                                    <form onSubmit={handleCreateIncident} className="mt-6">
                                        <SheetHeader>
                                            <SheetTitle>Crear Nuevo Incidente</SheetTitle>
                                        </SheetHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="service" className="text-right">
                                                    Servicio
                                                </Label>
                                                <div className="col-span-3">
                                                    <div className="relative">
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={isServiceComboboxOpen}
                                                            className="w-full justify-between"
                                                            onClick={() => setServiceComboboxOpen(!isServiceComboboxOpen)}
                                                        >
                                                            {newIncidentService || "Seleccionar servicio..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                        {isServiceComboboxOpen && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-40"
                                                                    onClick={() => setServiceComboboxOpen(false)}
                                                                />
                                                                <div className="absolute top-full z-50 mt-1 w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center border-b px-3 py-2">
                                                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                                            <Input
                                                                                placeholder="Buscar servicio..."
                                                                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                                                                                value={serviceSearch}
                                                                                onChange={(e) => setServiceSearch(e.target.value)}
                                                                                autoFocus
                                                                            />
                                                                        </div>
                                                                        <div className="h-[300px] overflow-y-auto p-1">
                                                                            {(services || [])
                                                                                .filter((s) =>
                                                                                    s.SERVICE_NAME && s.SERVICE_NAME.toLowerCase().includes(serviceSearch.toLowerCase())
                                                                                )
                                                                                .map((s) => (
                                                                                    <button
                                                                                        key={s.SERVICE_NAME}
                                                                                        type="button"
                                                                                        className={cn(
                                                                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                                                            newIncidentService === s.SERVICE_NAME && "bg-accent"
                                                                                        )}
                                                                                        onClick={() => {
                                                                                            setNewIncidentService(s.SERVICE_NAME);
                                                                                            setServiceComboboxOpen(false);
                                                                                            setServiceSearch("");
                                                                                        }}
                                                                                    >
                                                                                        <Check
                                                                                            className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                newIncidentService === s.SERVICE_NAME ? "opacity-100" : "opacity-0"
                                                                                            )}
                                                                                        />
                                                                                        {s.SERVICE_NAME}
                                                                                    </button>
                                                                                ))}
                                                                            {(services || []).filter((s) =>
                                                                                s.SERVICE_NAME && s.SERVICE_NAME.toLowerCase().includes(serviceSearch.toLowerCase())
                                                                            ).length === 0 && (
                                                                                    <div className="py-6 text-center text-sm">
                                                                                        No se encontró el servicio.
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="canal" className="text-right">
                                                    Canal
                                                </Label>
                                                <Input
                                                    id="canal"
                                                    value={newIncidentService && services ? (services.find(s => s.SERVICE_NAME === newIncidentService)?.Canal || "") : ""}
                                                    className="col-span-3"
                                                    disabled
                                                    placeholder="Seleccione un servicio primero"
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
                                                <Label htmlFor="teamsLink" className="text-right">
                                                    Link de Teams
                                                </Label>
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <Input
                                                        id="teamsLink"
                                                        value={newIncidentTeamsLink}
                                                        onChange={(e) => setNewIncidentTeamsLink(e.target.value)}
                                                        placeholder="Genere o pegue el link aquí"
                                                    />
                                                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateLink} disabled={isGeneratingLink || !newIncidentService}>
                                                        {isGeneratingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
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
                                        <SheetFooter>
                                            <SheetClose asChild>
                                                <Button type="button" variant="secondary">Cancelar</Button>
                                            </SheetClose>
                                            <Button type="submit" disabled={isCreatingIncident}>
                                                {isCreatingIncident && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isCreatingIncident ? "Creando..." : "Crear"}
                                            </Button>
                                        </SheetFooter>
                                    </form>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                                    <div className="flex items-center gap-2">
                                        <BarChart className="h-5 w-5" />
                                        <span><span className="font-bold text-foreground">{stats?.totalIncidents || 0}</span> Incidentes Totales</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-6" />
                                    <div className="flex items-center gap-2">
                                        <Server className="h-5 w-5" />
                                        <span><span className="font-bold text-foreground">{stats?.activeIncidents || 0}</span> Incidentes Activos</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-6" />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span><span className="font-bold text-foreground">{stats?.criticalIncidents || 0}</span> Incidentes Críticos</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                                <div className="flex flex-col gap-4 rounded-lg md:flex-row md:items-center mt-6">
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
                                                <SelectItem value="all">Prioridades</SelectItem>
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
                                                <SelectItem value="all">Estados</SelectItem>
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
                                                <SelectItem value="all">Ambientes</SelectItem>
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
                                {stats && !isLoading && <DashboardCharts stats={stats} />}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </TooltipProvider>
        </ProtectedRoute>
    );
}

export default DashboardPage;
