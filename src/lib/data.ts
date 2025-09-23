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
  },
];

const fallbackUpdates: IncidentUpdate[] = [
    { id: 1, incidentId: 1, text: "Incidente declarado, P0 debido al impacto generalizado.", timestamp: "2024-07-22T10:31:00Z" },
    { id: 2, incidentId: 1, text: "Equipo del servicio de autenticación contactado.", timestamp: "2024-07-22T10:35:00Z" },
    { id: 3, incidentId: 2, text: "Investigando informes de pagos fallidos.", timestamp: "2024-07-22T14:02:00Z" },
    { id: 4, incidentId: 2, text: "Problema identificado con el proveedor ascendente.", timestamp: "2024-07-22T14:30:00Z" },
    { id: 5, incidentId: 2, text: "El proveedor ascendente resolvió el problema. Monitoreando transacciones.", timestamp: "2024-07-22T15:00:00Z" },
    { id: 6, incidentId: 2, text: "Las transacciones han vuelto a la normalidad. Cerrando incidente.", timestamp: "2024-07-22T15:15:00Z" }
];

function parseAffectDetails(details: string): { service: string; description: string } {
  const serviceMatch = details.match(/Servicio:\s*(.*?)\s*Descripción:/);
  const descriptionMatch = details.match(/Descripción:\s*(.*)/);

  const service = serviceMatch ? serviceMatch[1].trim() : "N/A";
  const description = descriptionMatch ? descriptionMatch[1].trim() : details;

  return { service, description };
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/de271aba90734dbfbf3276dc9791b5e0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=BR1gsw9rIACMMFNdaLQ8C6hP-UQVfNcs4uflH_lY0-A'); 
    if (!response.ok) {
       console.warn('La API falló, usando datos de respaldo.');
      return fallbackIncidents;
    }
    const data = await response.json();

    const incidentsData = data.value || [];

    if (!Array.isArray(incidentsData)) {
      console.error('La respuesta de la API no es un array y no se pudo encontrar un array de incidentes en el objeto de respuesta.', data);
      return [];
    }
    
    // Map API response to Incident[]
    return incidentsData.map((item: any): Incident => {
      const { service, description } = parseAffectDetails(item.AFFECT_DETAILS || "");
      
      let priority: Incident["priority"] = "Baja";
      if(item.AFFECT_PRIORITY) {
          const p = item.AFFECT_PRIORITY.charAt(0).toUpperCase() + item.AFFECT_PRIORITY.slice(1).toLowerCase();
          if (p === "Crítica" || p === "Alta" || p === "Media" || p === "Baja") {
              priority = p;
          }
      }

      return {
        id: item.Id,
        service: service,
        description: description,
        startTime: item.AFFECT_START_DATE,
        priority: priority,
        status: item.AFFECT_STATE === "Cerrada" ? "Cerrado" : item.AFFECT_STATE,
        environment: item.AFFECT_ENVIROMENT || "Producción",
        sessionLink: item.AFFECT_LINK,
      };
    });
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    return fallbackIncidents;
  }
}

export async function addIncident(incident: Omit<Incident, 'id' | 'status'>): Promise<Incident> {
  const newIncidentData = {
    ...incident,
    status: 'Abierto',
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
    
    // Also create the first update
    await addIncidentUpdate(createdIncident.id, 'Incidente creado.');

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
    // Also create the first update
    addIncidentUpdate(newId, 'Incidente creado.');
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

export async function getIncidentUpdates(incidentId: number): Promise<IncidentUpdate[]> {
    try {
        // TODO: Reemplaza con la URL de tu API real
        const response = await fetch(`/api/incidents/${incidentId}/updates`);
        if (!response.ok) {
            console.warn(`API falló para las actualizaciones del incidente ${incidentId}, usando datos de respaldo.`);
            return fallbackUpdates.filter(update => update.incidentId === incidentId);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener las actualizaciones del incidente ${incidentId}:`, error);
        return fallbackUpdates.filter(update => update.incidentId === incidentId);
    }
}


export async function addIncidentUpdate(incidentId: number, text: string): Promise<IncidentUpdate> {
    const newUpdateData = {
        incidentId,
        text,
        timestamp: new Date().toISOString()
    };
    try {
        const response = await fetch(`/api/incidents/${incidentId}/updates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUpdateData),
        });
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al agregar la actualización del incidente:', error);
        const newId = Math.max(0, ...fallbackUpdates.map(u => u.id)) + 1;
        const newUpdate: IncidentUpdate = {
            id: newId,
            ...newUpdateData
        };
        fallbackUpdates.push(newUpdate);
        return newUpdate;
    }
}


export async function updateIncidentStatus(id: number, status: IncidentStatus): Promise<Incident | undefined> {
    try {
        // TODO: Reemplaza con la URL de tu API real
        const response = await fetch(`/api/incidents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta');
        }
        return await response.json();
    } catch (error) {
        console.error('Error al actualizar el estado del incidente:', error);
        
        const incident = fallbackIncidents.find(i => i.id === id);
        if (!incident) return undefined;

        incident.status = status;
        return incident;
    }
}
