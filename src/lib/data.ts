import type { Incident, IncidentStatus, IncidentUpdate } from "./types";

export let incidents: Incident[] = [
  {
    id: 1,
    service: "Auth Service",
    startTime: "2024-07-22T10:30:00Z",
    description: "Users are unable to log in.",
    priority: "P0",
    environment: "Production",
    status: "Open",
    updates: [
      { text: "Incident declared, P0 due to widespread impact.", timestamp: "2024-07-22T10:31:00Z" },
      { text: "Auth service team engaged.", timestamp: "2024-07-22T10:35:00Z" }
    ],
    sessionLink: "https://example.zoom.us/j/1234567890",
  },
  {
    id: 2,
    service: "Payment Gateway",
    startTime: "2024-07-22T14:00:00Z",
    description: "Credit card transactions are failing.",
    priority: "P1",
    environment: "Production",
    status: "Closed",
    updates: [
      { text: "Investigating reports of failed payments.", timestamp: "2024-07-22T14:02:00Z" },
      { text: "Identified issue with upstream provider.", timestamp: "2024-07-22T14:30:00Z" },
      { text: "Upstream provider resolved the issue. Monitoring transactions.", timestamp: "2024-07-22T15:00:00Z" },
      { text: "Transactions are back to normal. Closing incident.", timestamp: "2024-07-22T15:15:00Z" }
    ],
  },
  {
    id: 3,
    service: "API",
    startTime: "2024-07-22T09:00:00Z",
    description: "High latency on /users endpoint.",
    priority: "P2",
    environment: "Staging",
    status: "On Hold",
    updates: [
      { text: "Monitoring latency on staging environment.", timestamp: "2024-07-22T09:05:00Z" },
      { text: "Awaiting new deployment to test fix. Incident on hold.", timestamp: "2024-07-22T11:00:00Z" }
    ],
    sessionLink: "https://example.zoom.us/j/0987654321",
  },
  {
    id: 4,
    service: "Frontend",
    startTime: "2024-07-21T23:45:00Z",
    description: "CSS is not loading on the dashboard.",
    priority: "P3",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 5,
    service: "Database",
    startTime: "2024-07-22T11:20:00Z",
    description: "High number of slow queries.",
    priority: "P1",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 6,
    service: "Worker",
    startTime: "2024-07-22T16:05:00Z",
    description: "Background jobs are not being processed.",
    priority: "P2",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 7,
    service: "Cache",
    startTime: "2024-06-28T08:00:00Z",
    description: "High eviction rate.",
    priority: "P2",
    environment: "Staging",
    status: "Closed",
    updates: [],
  },
  {
    id: 8,
    service: "Search Service",
    startTime: "2024-07-22T18:30:00Z",
    description: "Search results are inconsistent.",
    priority: "P3",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 9,
    service: "Logging Pipeline",
    startTime: "2024-07-20T05:00:00Z",
    description: "Logs are being dropped.",
    priority: "P1",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 10,
    service: "Auth Service",
    startTime: "2024-06-15T12:00:00Z",
    description: "Token refresh is failing for some users.",
    priority: "P1",
    environment: "Production",
    status: "Closed",
    updates: [],
  },
  {
    id: 11,
    service: "API",
    startTime: "2024-07-22T01:00:00Z",
    description: "500 errors on /orders endpoint.",
    priority: "P0",
    environment: "Production",
    status: "Open",
    updates: [],
    sessionLink: "https://example.zoom.us/j/1122334455",
  },
  {
    id: 12,
    service: "Database",
    startTime: "2024-07-22T19:00:00Z",
    description: "Read replicas are out of sync.",
    priority: "P2",
    environment: "Staging",
    status: "Open",
    updates: [],
  },
  {
    id: 13,
    service: "Frontend",
    startTime: "2024-07-18T10:00:00Z",
    description: "Typo in the main heading.",
    priority: "P3",
    environment: "Production",
    status: "Closed",
    updates: [],
  },
  {
    id: 14,
    service: "Payment Gateway",
    startTime: "2024-07-21T20:45:00Z",
    description: "Latency in PayPal webhook processing.",
    priority: "P1",
    environment: "Production",
    status: "Open",
    updates: [],
  },
  {
    id: 15,
    service: "API",
    startTime: "2024-07-10T09:15:00Z",
    description: "Incorrect data being returned from /products.",
    priority: "P2",
    environment: "Production",
    status: "Closed",
    updates: [],
  },
];

export function addIncident(incident: Omit<Incident, 'id' | 'updates' | 'status'>) {
  const newId = Math.max(...incidents.map(i => i.id)) + 1;
  const newIncident: Incident = {
    ...incident,
    id: newId,
    status: 'Open',
    updates: [{ text: 'Incident created.', timestamp: new Date().toISOString() }],
  };
  incidents.unshift(newIncident);
  return newIncident;
}

export function getIncidentById(id: number): Incident | undefined {
  return incidents.find(incident => incident.id === id);
}

export function updateIncident(id: number, status: IncidentStatus, updateText: string | null): Incident | undefined {
    const incident = getIncidentById(id);
    if (!incident) return;

    if (updateText) {
        const newUpdate: IncidentUpdate = {
            text: updateText,
            timestamp: new Date().toISOString()
        };
        incident.updates.push(newUpdate);
    }

    if (status !== incident.status) {
        incident.status = status;
        const statusUpdate: IncidentUpdate = {
            text: `Incident status changed to ${status}.`,
            timestamp: new Date().toISOString()
        };
        incident.updates.push(statusUpdate);
    }
    
    return incident;
}
