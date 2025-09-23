"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { getIncidentById, updateIncident, incidents as allIncidents } from "@/lib/data";
import { type Incident, type IncidentStatus } from "@/lib/types";
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
  Tag,
  Briefcase,
  Layers,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const priorityMap = {
  P0: { icon: ShieldAlert, className: "text-red-500", badgeClassName: "bg-red-100 text-red-800" },
  P1: { icon: TriangleAlert, className: "text-orange-500", badgeClassName: "bg-orange-100 text-orange-800" },
  P2: { icon: AlertCircle, className: "text-yellow-500", badgeClassName: "bg-yellow-100 text-yellow-800" },
  P3: { icon: Info, className: "text-blue-500", badgeClassName: "bg-blue-100 text-blue-800" },
};

const statusMap = {
  "Open": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800" },
  "On Hold": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800" },
  "Closed": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800" },
};

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      const id = parseInt(params.id as string, 10);
      const fetchedIncident = getIncidentById(id);
      setIncident(fetchedIncident || null);
    }
  }, [params.id]);

  if (!incident) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Incident Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The incident you are looking for does not exist.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  const handleUpdate = (status: IncidentStatus, updateText: string | null = null) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const updatedIncident = updateIncident(incident.id, status, updateText);
      if (updatedIncident) {
        setIncident({ ...updatedIncident });
      }
      setNewUpdate("");
      setIsSubmitting(false);
    }, 500);
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    const updateText = `Status changed to ${newStatus}.`;
    handleUpdate(newStatus, updateText);
  }

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() === "") return;
    handleUpdate(incident.status, newUpdate);
  }

  const PriorityIcon = priorityMap[incident.priority].icon;
  const StatusIcon = statusMap[incident.status].icon;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <CardTitle className="text-3xl font-bold">{incident.service}: {incident.description}</CardTitle>
                <CardDescription className="mt-2 text-lg">
                    Incident #{incident.id}
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
                    <span>{new Date(incident.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{incident.service}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>{incident.environment}</span>
                </div>
                {incident.sessionLink && (
                     <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <Link href={incident.sessionLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                           Join Session
                        </Link>
                    </div>
                )}
            </div>
            
            <Separator className="my-6" />

            <div>
                <h3 className="text-xl font-semibold mb-4">Incident Timeline</h3>
                <div className="space-y-4">
                    {incident.updates.map((update, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-primary rounded-full" />
                                <div className="w-px h-full bg-border" />
                            </div>
                            <div>
                                <p className="font-medium">{update.text}</p>
                                <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                     {incident.updates.length === 0 && (
                        <p className="text-muted-foreground">No updates yet.</p>
                     )}
                </div>
            </div>

            <Separator className="my-6" />
            
            <form onSubmit={handleAddUpdate}>
                <h3 className="text-xl font-semibold mb-4">Add Update</h3>
                <Textarea 
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Provide an update on the incident..."
                    className="mb-4"
                    disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                       {incident.status !== 'On Hold' && <Button onClick={() => handleStatusChange("On Hold")} type="button" variant="outline" disabled={isSubmitting}>Put on Hold</Button>}
                       {incident.status !== 'Open' && <Button onClick={() => handleStatusChange("Open")} type="button" variant="outline" disabled={isSubmitting}>Reopen Incident</Button>}
                       {incident.status !== 'Closed' && <Button onClick={() => handleStatusChange("Closed")} type="button" variant="destructive" disabled={isSubmitting}>Close Incident</Button>}
                    </div>
                     <Button type="submit" disabled={isSubmitting || newUpdate.trim() === ''}>
                        {isSubmitting ? "Submitting..." : "Add Update"}
                    </Button>
                </div>
            </form>

        </CardContent>
      </Card>
    </div>
  );
}
