"use client";

import type { Incident, IncidentPriority } from "@/lib/types";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Info, ShieldAlert, TriangleAlert, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IncidentTableProps {
  incidents: Incident[];
}

const priorityMap: Record<IncidentPriority, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  P0: { icon: ShieldAlert, className: "text-red-500", badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
  P1: { icon: TriangleAlert, className: "text-orange-500", badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300" },
  P2: { icon: AlertCircle, className: "text-yellow-500", badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" },
  P3: { icon: Info, className: "text-blue-500", badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" },
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
              <TableHead>Service</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead className="text-right">Session Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length > 0 ? (
              incidents.map((incident, index) => {
                const PriorityIcon = priorityMap[incident.priority].icon;
                const priorityClassName = priorityMap[incident.priority].className;
                const badgeClassName = priorityMap[incident.priority].badgeClassName;
                return (
                  <TableRow key={`${incident.service}-${index}`}>
                    <TableCell className="font-medium">{incident.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 font-medium", badgeClassName)}>
                        <div className="flex items-center gap-2">
                          <PriorityIcon className={cn("h-4 w-4", priorityClassName)} />
                          <span>{incident.priority}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.description}</TableCell>
                    <TableCell>{incident.environment}</TableCell>
                    <TableCell>
                      {new Date(incident.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {incident.sessionLink ? (
                        <Link href={incident.sessionLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:underline">
                          <LinkIcon size={16} />
                           Join
                        </Link>
                      ) : (
                        "-"
                      )}
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
