export type IncidentPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type IncidentStatus = "Proceso" | "En espera" | "Cerrado" | "Cerrada";

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
  endDate?: string; // ISO 8601 format
  description: string;
  priority: IncidentPriority;
  environment: string;
  status: IncidentStatus;
}

export interface Service {
  ID: number;
  SERVICE_NAME: string;
}

export interface ServiceApiResponse {
  value: Service[];
}

export interface User {
  name: string;
  email: string;
}
