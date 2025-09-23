"use client";

import { useState, useMemo, useTransition } from "react";
import Link from 'next/link';
import {
  BarChart,
  Bell,
  Clock,
  Download,
  Home,
  LineChart,
  Loader2,
  PlusCircle,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { incidents as allIncidents, addIncident } from "@/lib/data";
import { type Incident, type IncidentPriority } from "@/lib/types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { getWeeklySummary, getMonthlySummary } from "@/app/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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

const priorities: IncidentPriority[] = ["P0", "P1", "P2", "P3"];
const environments = ["Production", "Staging"];

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<IncidentPriority | "all">("all");
  const [environment, setEnvironment] = useState<string>("all");
  
  const [summary, setSummary] = useState<string>("");
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isGenerating, startTransition] = useTransition();

  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Form state for new incident
  const [newIncidentService, setNewIncidentService] = useState("");
  const [newIncidentDescription, setNewIncidentDescription] = useState("");
  const [newIncidentPriority, setNewIncidentPriority] = useState<IncidentPriority>("P2");
  const [newIncidentEnvironment, setNewIncidentEnvironment] = useState("Production");
  const [newIncidentSessionLink, setNewIncidentSessionLink] = useState("");
  const [incidents, setIncidents] = useState(allIncidents);


  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      return (
        (search === "" || incident.service.toLowerCase().includes(search.toLowerCase())) &&
        (priority === "all" || incident.priority === priority) &&
        (environment === "all" || incident.environment === environment)
      );
    });
  }, [search, priority, environment, incidents]);

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
    const incidentRate = totalIncidents > 0 ? "1.2/day" : "N/A";
    return { totalIncidents, avgResponseTime, avgResolutionTime, incidentRate };
  }, [filteredIncidents]);

  const handleDownload = () => {
    const headers = ["Service", "Start Time", "Description", "Priority", "Environment", "Session Link"];
    const rows = filteredIncidents.map((i) =>
      [
        i.service,
        i.startTime,
        `"${i.description}"`,
        i.priority,
        i.environment,
        i.sessionLink,
      ].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "incident_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerateSummary = (period: 'weekly' | 'monthly') => {
    startTransition(async () => {
      let result = '';
      if (period === 'weekly') {
        setSummaryTitle('Weekly Incident Summary');
        // @ts-ignore
        result = await getWeeklySummary(filteredIncidents);
      } else {
        setSummaryTitle('Monthly Incident Summary');
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        // @ts-ignore
        result = await getMonthlySummary(currentMonth, filteredIncidents);
      }
      setSummary(result);
      setIsSummaryOpen(true);
    });
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident: Incident = {
      service: newIncidentService,
      startTime: new Date().toISOString(),
      description: newIncidentDescription,
      priority: newIncidentPriority,
      environment: newIncidentEnvironment,
      sessionLink: newIncidentSessionLink,
    };
    addIncident(newIncident);
    setIncidents([...allIncidents]);
    setCreateModalOpen(false);
    // Reset form
    setNewIncidentService("");
    setNewIncidentDescription("");
    setNewIncidentPriority("P2");
    setNewIncidentEnvironment("Production");
    setNewIncidentSessionLink("");
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-6 w-6" />
              <span className="">Incident Insight</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Analytics
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-xl font-bold tracking-tight">Incident Insight</h1>
          </div>
          <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateIncident}>
                  <DialogHeader>
                    <DialogTitle>Create New Incident</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="service" className="text-right">
                        Service
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
                        Description
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
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                       <Select onValueChange={(value) => setNewIncidentPriority(value as IncidentPriority)} defaultValue={newIncidentPriority}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="environment" className="text-right">
                        Environment
                      </Label>
                      <Select onValueChange={(value) => setNewIncidentEnvironment(value)} defaultValue={newIncidentEnvironment}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {environments.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sessionLink" className="text-right">
                        Session Link
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
                       <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="ml-auto flex-initial">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Summary
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleGenerateSummary('weekly')}>
                    Weekly Summary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateSummary('monthly')}>
                    Monthly Summary
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <MetricCard title="Total Incidents" value={metrics.totalIncidents} icon={BarChart} />
            <MetricCard title="Avg. Response Time" value={metrics.avgResponseTime} icon={Clock} />
            <MetricCard title="Avg. Resolution Time" value={metrics.avgResolutionTime} icon={ShieldAlert} />
            <MetricCard title="Overall Incident Rate" value={metrics.incidentRate} icon={TriangleAlert} />
          </div>

          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by service..."
                className="w-full rounded-lg bg-background pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:flex md:flex-row md:grid-cols-2">
              <Select value={priority} onValueChange={(value) => {
                  setPriority(value as IncidentPriority | "all");
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={environment} onValueChange={(value) => {
                setEnvironment(value as "all" | string);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by environment" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    {environments.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <IncidentTable incidents={paginatedIncidents} />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          <AlertDialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{summaryTitle}</AlertDialogTitle>
                <AlertDialogDescription className="max-h-[60vh] overflow-y-auto pt-2">
                  {summary}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsSummaryOpen(false)}>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
