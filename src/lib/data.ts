import type { Incident, IncidentStatus, IncidentUpdate } from "./types";

// Esta es una matriz de respaldo en caso de que la API falle, o para desarrollo sin un backend.
const fallbackIncidents: Incident[] = [
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
];


export async function getIncidents(): Promise<Incident[]> {
  try {
    // TODO: Reemplaza con la URL de tu API real
    const response = await fetch('/api/incidents'); 
    if (!response.ok) {
      // Si la API falla, usa los datos de respaldo
      console.warn('La API falló, usando datos de respaldo.');
      return fallbackIncidents;
    }
    const incidents: Incident[] = await response.json();
    return incidents;
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    return fallbackIncidents;
  }
}

export async function addIncident(incident: Omit<Incident, 'id' | 'updates' | 'status'>): Promise<Incident> {
  const newIncidentData = {
    ...incident,
    status: 'Abierto',
    updates: [{ text: 'Incidente creado.', timestamp: new Date().toISOString() }],
  };
  
  try {
    // TODO: Reemplaza con la URL de tu API real
    const response = await fetch('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newIncidentData),
    });
    if (!response.ok) {
      throw new Error('La respuesta de la red no fue correcta');
    }
    const createdIncident: Incident = await response.json();
    return createdIncident;
  } catch (error) {
    console.error('Error al crear el incidente:', error);
    // Como respaldo, simula la adición localmente si la API falla
    const newId = Math.max(...fallbackIncidents.map(i => i.id)) + 1;
    const createdIncident: Incident = {
        ...newIncidentData,
        id: newId,
    };
    fallbackIncidents.unshift(createdIncident);
    return createdIncident;
  }
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
   try {
    // TODO: Reemplaza con la URL de tu API real
    const response = await fetch(`/api/incidents/${id}`);
    if (!response.ok) {
      console.warn(`API falló para el incidente ${id}, usando datos de respaldo.`);
      return fallbackIncidents.find(incident => incident.id === id);
    }
    const incident: Incident = await response.json();
    return incident;
  } catch (error) {
    console.error(`Error al obtener el incidente ${id}:`, error);
    return fallbackIncidents.find(incident => incident.id === id);
  }
}

export async function updateIncident(id: number, status: IncidentStatus, updateText: string | null): Promise<Incident | undefined> {
    const updates: IncidentUpdate[] = [];
    if (updateText) {
        updates.push({ text: updateText, timestamp: new Date().toISOString() });
    }

    try {
        // TODO: Reemplaza con la URL de tu API real
        const response = await fetch(`/api/incidents/${id}`, {
            method: 'PATCH', // o 'PUT'
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, updates }),
        });
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar el incidente:', error);
        
        // Simulación de respaldo si la API falla
        const incident = fallbackIncidents.find(i => i.id === id);
        if (!incident) return undefined;

        if (updateText) {
            incident.updates.push({ text: updateText, timestamp: new Date().toISOString() });
        }
        if (status !== incident.status) {
            incident.status = status;
            incident.updates.push({ text: `El estado del incidente cambió a ${status}.`, timestamp: new Date().toISOString() });
        }
        return incident;
    }
}
