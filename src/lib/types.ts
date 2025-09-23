export type IncidentPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type IncidentStatus = "Abierto" | "En espera" | "Cerrado";

export interface IncidentUpdate {
  id: number;
  incidentId: number;
  text: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  service: string;
  startTime: string; // ISO 8601 format
  description: string;
  priority: IncidentPriority;
  environment: string;
  status: IncidentStatus;
  sessionLink?: string;
}
