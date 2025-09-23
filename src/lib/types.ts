export type IncidentPriority = "P0" | "P1" | "P2" | "P3";

export interface Incident {
  service: string;
  startTime: string; // ISO 8601 format
  description: string;
  priority: IncidentPriority;
  environment: string;
  sessionLink?: string;
}
