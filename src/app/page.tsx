"use client";

import { useState, useMemo, useTransition } from "react";
import {
  AlertCircle,
  BarChart,
  Clock,
  Download,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { incidents as allIncidents } from "@/lib/data";
import { type Incident, type IncidentStatus, type IncidentSeverity } from "@/lib/types";
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

const severities: IncidentSeverity[] = ["Emergency", "High", "Medium", "Low"];
const statuses: IncidentStatus[] = ["New", "In Progress", "Resolved"];

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [severity, setSeverity] = useState<IncidentSeverity | "all">("all");
  const [country, setCountry] = useState<string>("all");
  
  const [summary, setSummary] = useState<string>("");
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isGenerating, startTransition] = useTransition();

  const countries = useMemo(() => {
    const uniqueCountries = new Set(allIncidents.map((i) => i.location.country));
    return ["all", ...Array.from(uniqueCountries)];
  }, []);

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((incident) => {
      return (
        (search === "" || incident.reference.toLowerCase().includes(search.toLowerCase())) &&
        (status === "all" || incident.status === status) &&
        (severity === "all" || incident.severity === severity) &&
        (country === "all" || incident.location.country === country)
      );
    });
  }, [search, status, severity, country]);

  const metrics = useMemo(() => {
    const totalIncidents = filteredIncidents.length;
    // Dummy calculations for metrics
    const avgResponseTime = totalIncidents > 0 ? "35m" : "N/A";
    const avgResolutionTime = totalIncidents > 0 ? "4h 15m" : "N/A";
    const incidentRate = totalIncidents > 0 ? "1.2/day" : "N/A";
    return { totalIncidents, avgResponseTime, avgResolutionTime, incidentRate };
  }, [filteredIncidents]);

  const handleDownload = () => {
    const headers = ["Reference", "Status", "Location", "Time", "Type", "Severity"];
    const rows = filteredIncidents.map((i) =>
      [
        i.reference,
        i.status,
        `${i.location.city}, ${i.location.country}`,
        i.time,
        i.type,
        i.severity,
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
        result = await getWeeklySummary(filteredIncidents);
      } else {
        setSummaryTitle('Monthly Incident Summary');
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        result = await getMonthlySummary(currentMonth, filteredIncidents);
      }
      setSummary(result);
      setIsSummaryOpen(true);
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Incident Insight</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isGenerating}>
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
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
        
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
              placeholder="Search by reference..."
              className="w-full rounded-lg bg-background pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-row">
            <Select value={status} onValueChange={(value) => setStatus(value as IncidentStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={(value) => setSeverity(value as IncidentSeverity | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severities.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={(value) => setCountry(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c === "all" ? "All Countries" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <IncidentTable incidents={filteredIncidents} />

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
  );
}
