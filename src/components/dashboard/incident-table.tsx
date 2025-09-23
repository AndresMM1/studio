"use client";

import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, ShieldAlert, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentTableProps {
  incidents: Incident[];
}

const statusStyles: Record<IncidentStatus, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
};

const severityMap: Record<IncidentSeverity, { icon: React.ElementType; className: string }> = {
  Emergency: { icon: ShieldAlert, className: "text-red-500" },
  High: { icon: TriangleAlert, className: "text-orange-500" },
  Medium: { icon: AlertCircle, className: "text-yellow-500" },
  Low: { icon: Info, className: "text-blue-500" },
};

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents</CardTitle>
        <CardDescription>A list of recent incidents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length > 0 ? (
              incidents.map((incident) => {
                const SeverityIcon = severityMap[incident.severity].icon;
                const severityClassName = severityMap[incident.severity].className;
                return (
                  <TableRow key={incident.reference}>
                    <TableCell className="font-medium">{incident.reference}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", statusStyles[incident.status])}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SeverityIcon className={cn("h-5 w-5", severityClassName)} />
                        <span>{incident.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {incident.location.city}, {incident.location.country}
                    </TableCell>
                    <TableCell>{incident.type}</TableCell>
                    <TableCell className="text-right">
                      {new Date(incident.time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    