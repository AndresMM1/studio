import type { Incident, IncidentStatus, IncidentUpdate } from "./types";

export let incidents: Incident[] = [
  {
    id: 1,
    service: "Servicio de Autenticación",
    startTime: "2024-07-22T10:30:00Z",
    description: "Los usuarios no pueden iniciar sesión.",
    priority: "Crítica",
    environment: "Producción",
    status: "Abierto",
    updates: [
      { text: "Incidente declarado, P0 debido al impacto generalizado.", timestamp: "2024-07-22T10:31:00Z" },
      { text: "Equipo del servicio de autenticación contactado.", timestamp: "2024-07-22T10:35:00Z" }
    ],
    sessionLink: "https://example.zoom.us/j/1234567890",
  },
  {
    id: 2,
    service: "Pasarela de Pagos",
    startTime: "2024-07-22T14:00:00Z",
    description: "Las transacciones con tarjeta de crédito están fallando.",
    priority: "Alta",
    environment: "Producción",
    status: "Cerrado",
    updates: [
      { text: "Investigando informes de pagos fallidos.", timestamp: "2024-07-22T14:02:00Z" },
      { text: "Problema identificado con el proveedor ascendente.", timestamp: "2024-07-22T14:30:00Z" },
      { text: "El proveedor ascendente resolvió el problema. Monitoreando transacciones.", timestamp: "2024-07-22T15:00:00Z" },
      { text: "Las transacciones han vuelto a la normalidad. Cerrando incidente.", timestamp: "2024-07-22T15:15:00Z" }
    ],
  },
  {
    id: 3,
    service: "API",
    startTime: "2024-07-22T09:00:00Z",
    description: "Alta latencia en el endpoint /users.",
    priority: "Media",
    environment: "Staging",
    status: "En espera",
    updates: [
      { text: "Monitoreando la latencia en el ambiente de staging.", timestamp: "2024-07-22T09:05:00Z" },
      { text: "Esperando nuevo despliegue para probar la solución. Incidente en espera.", timestamp: "2024-07-22T11:00:00Z" }
    ],
    sessionLink: "https://example.zoom.us/j/0987654321",
  },
  {
    id: 4,
    service: "Frontend",
    startTime: "2024-07-21T23:45:00Z",
    description: "El CSS no se carga en el panel.",
    priority: "Baja",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 5,
    service: "Base de Datos",
    startTime: "2024-07-22T11:20:00Z",
    description: "Alto número de consultas lentas.",
    priority: "Alta",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 6,
    service: "Worker",
    startTime: "2024-07-22T16:05:00Z",
    description: "Los trabajos en segundo plano no se están procesando.",
    priority: "Media",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 7,
    service: "Caché",
    startTime: "2024-06-28T08:00:00Z",
    description: "Alta tasa de desalojo.",
    priority: "Media",
    environment: "Staging",
    status: "Cerrado",
    updates: [],
  },
  {
    id: 8,
    service: "Servicio de Búsqueda",
    startTime: "2024-07-22T18:30:00Z",
    description: "Los resultados de búsqueda son inconsistentes.",
    priority: "Baja",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 9,
    service: "Tubería de Logs",
    startTime: "2024-07-20T05:00:00Z",
    description: "Los logs se están perdiendo.",
    priority: "Alta",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 10,
    service: "Servicio de Autenticación",
    startTime: "2024-06-15T12:00:00Z",
    description: "La actualización de tokens está fallando para algunos usuarios.",
    priority: "Alta",
    environment: "Producción",
    status: "Cerrado",
    updates: [],
  },
  {
    id: 11,
    service: "API",
    startTime: "2024-07-22T01:00:00Z",
    description: "Errores 500 en el endpoint /orders.",
    priority: "Crítica",
    environment: "Producción",
    status: "Abierto",
    updates: [],
    sessionLink: "https://example.zoom.us/j/1122334455",
  },
  {
    id: 12,
    service: "Base de Datos",
    startTime: "2024-07-22T19:00:00Z",
    description: "Las réplicas de lectura no están sincronizadas.",
    priority: "Media",
    environment: "Staging",
    status: "Abierto",
    updates: [],
  },
  {
    id: 13,
    service: "Frontend",
    startTime: "2024-07-18T10:00:00Z",
    description: "Error de tipeo en el encabezado principal.",
    priority: "Baja",
    environment: "Producción",
    status: "Cerrado",
    updates: [],
  },
  {
    id: 14,
    service: "Pasarela de Pagos",
    startTime: "2024-07-21T20:45:00Z",
    description: "Latencia en el procesamiento del webhook de PayPal.",
    priority: "Alta",
    environment: "Producción",
    status: "Abierto",
    updates: [],
  },
  {
    id: 15,
    service: "API",
    startTime: "2024-07-10T09:15:00Z",
    description: "Datos incorrectos devueltos desde /products.",
    priority: "Media",
    environment: "Producción",
    status: "Cerrado",
    updates: [],
  },
];

export function addIncident(incident: Omit<Incident, 'id' | 'updates' | 'status'>) {
  const newId = Math.max(...incidents.map(i => i.id)) + 1;
  const newIncident: Incident = {
    ...incident,
    id: newId,
    status: 'Abierto',
    updates: [{ text: 'Incidente creado.', timestamp: new Date().toISOString() }],
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
            text: `El estado del incidente cambió a ${status}.`,
            timestamp: new Date().toISOString()
        };
        incident.updates.push(statusUpdate);
    }
    
    return incident;
}
