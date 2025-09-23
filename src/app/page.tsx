"use client";

import { useState, useMemo, useTransition } from "react";
import Link from 'next/link';
import {
  AlertCircle,
  BarChart,
  Bell,
  Clock,
  Download,
  Home,
  LineChart,
  Loader2,
  Package,
  Package2,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
  Users,
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Badge } from '@/components/ui/badge';

const severities: IncidentSeverity[] = ["Emergency", "High", "Medium", "Low"];
const statuses: IncidentStatus[] = ["New", "In Progress", "Resolved"];

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [severity, setSeverity] = useState<IncidentSeverity | "all">("all");
  const [country, setCountry] = useState<string>("all");
  
  const [summary, setSummary] = useState<string>("");
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isGenerating, startTransition] = useTransition();

  const [currentPage, setCurrentPage] = useState(1);

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
            <div className="ml-auto flex-initial">
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
                placeholder="Search by reference..."
                className="w-full rounded-lg bg-background pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:flex md:flex-row">
              <Select value={status} onValueChange={(value) => {
                  setStatus(value as IncidentStatus | "all");
                  setCurrentPage(1);
                }}>
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
              <Select value={severity} onValueChange={(value) => {
                setSeverity(value as IncidentSeverity | "all");
                setCurrentPage(1);
              }}>
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
              <Select value={country} onValueChange={(value) => {
                setCountry(value);
                setCurrentPage(1);
              }}>
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

    