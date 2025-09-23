import type { Incident } from "./types";

export let incidents: Incident[] = [
  {
    service: "Auth Service",
    startTime: "2024-07-22T10:30:00Z",
    description: "Users are unable to log in.",
    priority: "P0",
    environment: "Production",
    sessionLink: "https://example.zoom.us/j/1234567890",
  },
  {
    service: "Payment Gateway",
    startTime: "2024-07-22T14:00:00Z",
    description: "Credit card transactions are failing.",
    priority: "P1",
    environment: "Production",
  },
  {
    service: "API",
    startTime: "2024-07-22T09:00:00Z",
    description: "High latency on /users endpoint.",
    priority: "P2",
    environment: "Staging",
    sessionLink: "https://example.zoom.us/j/0987654321",
  },
  {
    service: "Frontend",
    startTime: "2024-07-21T23:45:00Z",
    description: "CSS is not loading on the dashboard.",
    priority: "P3",
    environment: "Production",
  },
  {
    service: "Database",
    startTime: "2024-07-22T11:20:00Z",
    description: "High number of slow queries.",
    priority: "P1",
    environment: "Production",
  },
  {
    service: "Worker",
    startTime: "2024-07-22T16:05:00Z",
    description: "Background jobs are not being processed.",
    priority: "P2",
    environment: "Production",
  },
  {
    service: "Cache",
    startTime: "2024-06-28T08:00:00Z",
    description: "High eviction rate.",
    priority: "P2",
    environment: "Staging",
  },
  {
    service: "Search Service",
    startTime: "2024-07-22T18:30:00Z",
    description: "Search results are inconsistent.",
    priority: "P3",
    environment: "Production",
  },
  {
    service: "Logging Pipeline",
    startTime: "2024-07-20T05:00:00Z",
    description: "Logs are being dropped.",
    priority: "P1",
    environment: "Production",
  },
  {
    service: "Auth Service",
    startTime: "2024-06-15T12:00:00Z",
    description: "Token refresh is failing for some users.",
    priority: "P1",
    environment: "Production",
  },
  {
    service: "API",
    startTime: "2024-07-22T01:00:00Z",
    description: "500 errors on /orders endpoint.",
    priority: "P0",
    environment: "Production",
    sessionLink: "https://example.zoom.us/j/1122334455",
  },
  {
    service: "Database",
    startTime: "2024-07-22T19:00:00Z",
    description: "Read replicas are out of sync.",
    priority: "P2",
    environment: "Staging",
  },
  {
    service: "Frontend",
    startTime: "2024-07-18T10:00:00Z",
    description: "Typo in the main heading.",
    priority: "P3",
    environment: "Production",
  },
  {
    service: "Payment Gateway",
    startTime: "2024-07-21T20:45:00Z",
    description: "Latency in PayPal webhook processing.",
    priority: "P1",
    environment: "Production",
  },
  {
    service: "API",
    startTime: "2024-07-10T09:15:00Z",
    description: "Incorrect data being returned from /products.",
    priority: "P2",
    environment: "Production",
  },
];

export function addIncident(incident: Incident) {
  incidents.unshift(incident);
}
