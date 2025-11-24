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
  startTime: string;
  endDate?: string;
  description: string;
  priority: IncidentPriority;
  environment: string;
  status: IncidentStatus;
  teamsLink?: string;
}

export interface Service {
  SERVICE_NAME: string;
  Canal: string;
}

export interface ServiceApiResponse {
  value: Service[];
}

export interface User {
  name: string;
  email: string;
}






export interface ClosureData {
  incidentId: number;
  startTime: string;
  endTime: string;
  service: string;
  description: string;
  solution: string;
  generatedAlerts: boolean;
  docResponsible: string;
  domainResponsible: string;
  initialAnalysis: string;
  rootCause: string;
  causeCategory: string;
  rootCauseIdentified: boolean;
  repetitiveIncident: boolean;
  solutionActivities: string;
  actionPlans: string;
  asdResponsible: string;
}