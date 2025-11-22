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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, ShieldAlert, TriangleAlert, HardHat, CheckCircle2, CircleOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface IncidentTableProps {
  incidents: Incident[];
}

const priorityMap: Record<IncidentPriority, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Crítica": { icon: ShieldAlert, className: "text-red-500", badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
  "Alta": { icon: TriangleAlert, className: "text-orange-500", badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300" },
  "Media": { icon: AlertCircle, className: "text-yellow-500", badgeClassName: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" },
  "Baja": { icon: Info, className: "text-primary", badgeClassName: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
};

const statusMap: Record<IncidentStatus, { icon: React.ElementType; className: string; badgeClassName: string }> = {
  "Proceso": { icon: HardHat, className: "text-green-600", badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
  "En espera": { icon: CircleOff, className: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300" },
  "Cerrado": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" },
  "Cerrada": { icon: CheckCircle2, className: "text-purple-600", badgeClassName: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" },
};

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow className="hover:bg-transparent border-primary/20">
            <TableHead className="text-primary font-semibold">Servicio</TableHead>
            <TableHead className="text-primary font-semibold">Prioridad</TableHead>
            <TableHead className="text-primary font-semibold">Estado</TableHead>
            <TableHead className="text-primary font-semibold">Descripción</TableHead>
            <TableHead className="text-primary font-semibold">Hora de inicio</TableHead>
            <TableHead className="text-primary font-semibold">Fecha de Finalización</TableHead>
            <TableHead className="text-right text-primary font-semibold">Acciones</TableHead>
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
              const isOpen = incident.status === "Proceso" || incident.status === "En espera";

              return (
                <TableRow
                  key={incident.id}
                  className={cn(isOpen && "bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 animate-pulse")}
                >
                  <TableCell className="font-bold text-primary">{incident.service}</TableCell>
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
                  <TableCell className="max-w-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="truncate block w-full text-left">
                          {incident.description}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-md">{incident.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(incident.startTime).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(incident.startTime).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {incident.endDate ? (
                      <div>
                        <div>{new Date(incident.endDate).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(incident.endDate).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                      <Link to={`/incident/${incident.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver detalle
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
