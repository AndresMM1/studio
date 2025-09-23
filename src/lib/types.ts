export type IncidentPriority = "P0" | "P1" | "P2" | "P3";
export type IncidentStatus = "Open" | "On Hold" | "Closed";

export interface IncidentUpdate {
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
  updates: IncidentUpdate[];
  sessionLink?: string;
}
