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
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, ShieldAlert, TriangleAlert, HardHat, CheckCircle2, CircleOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface IncidentTableProps {
  incidents: Incident[];
}

const priorityMap: Record<IncidentPriority, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Crítica": { icon: ShieldAlert, className: "text-red-500", badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
  "Alta": { icon: TriangleAlert, className: "text-orange-500", badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300" },
  "Media": { icon: AlertCircle, className: "text-yellow-500", badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" },
  "Baja": { icon: Info, className: "text-blue-500", badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" },
};

const statusMap: Record<IncidentStatus, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Abierto": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
  "En espera": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300" },
  "Cerrado": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" },
  "Cerrada": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" },
};

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Hora de inicio</TableHead>
            <TableHead>Fecha de Finalización</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
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
                    {incident.endDate ? new Date(incident.endDate).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/incident/${incident.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se encontraron incidentes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
