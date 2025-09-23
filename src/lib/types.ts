export type IncidentStatus = "New" | "In Progress" | "Resolved";
export type IncidentSeverity = "Emergency" | "High" | "Medium" | "Low";

export interface Incident {
  reference: string;
  status: IncidentStatus;
  location: {
    city: string;
    country: string;
  };
  time: string; // ISO 8601 format
  type: string;
  severity: IncidentSeverity;
}
