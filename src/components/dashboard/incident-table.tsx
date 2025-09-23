"use client";

import type { Incident, IncidentPriority, IncidentStatus } from "@/lib/types";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, ShieldAlert, TriangleAlert, Link as LinkIcon, HardHat, CheckCircle2, CircleOff, ExternalLink } from "lucide-react";
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

const statusMap: Record<IncidentStatus, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Open": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
  "On Hold": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300" },
  "Closed": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" },
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
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Session Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length > 0 ? (
              incidents.map((incident) => {
                const PriorityIcon = priorityMap[incident.priority].icon;
                const priorityClassName = priorityMap[incident.priority].className;
                const priorityBadgeClassName = priorityMap[incident.priority].badgeClassName;
                const StatusIcon = statusMap[incident.status].icon;
                const statusClassName = statusMap[incident.status].className;
                const statusBadgeClassName = statusMap[incident.status].badgeClassName;

                return (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 font-medium", priorityBadgeClassName)}>
                        <div className="flex items-center gap-2">
                          <PriorityIcon className={cn("h-4 w-4", priorityClassName)} />
                          <span>{incident.priority}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 font-medium", statusBadgeClassName)}>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn("h-4 w-4", statusClassName)} />
                          <span>{incident.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.description}</TableCell>
                    <TableCell>
                      {new Date(incident.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {incident.sessionLink ? (
                        <Link href={incident.sessionLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:underline">
                          <LinkIcon size={16} />
                           Join
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm">
                          <Link href={`/incident/${incident.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
