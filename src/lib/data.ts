import type { Incident, IncidentStatus, IncidentUpdate, IncidentPriority } from "./types";

// Esta es una matriz de respaldo en caso de que la API falle, o para desarrollo sin un backend.
const fallbackIncidents: Incident[] = [
    {
    id: 1,
    service: "Servicio de Autenticación",
    startTime: "2024-07-22T10:30:00Z",
    endDate: "2024-07-22T11:30:00Z",
    description: "Los usuarios no pueden iniciar sesión.",
    priority: "Crítica",
    environment: "Producción",
    status: "Abierto",
  },
  {
    id: 2,
    service: "Pasarela de Pagos",
    startTime: "2024-07-22T14:00:00Z",
    endDate: undefined,
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
      return fallbackIncidents;
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

      let status: Incident["status"] = "Abierto";
       if(item.AFFECT_STATE) {
          const s = item.AFFECT_STATE.charAt(0).toUpperCase() + item.AFFECT_STATE.slice(1).toLowerCase();
          if (s === "Abierto" || s === "En espera" || s === "Cerrado" || s === "Cerrada") {
              status = s;
          }
      }


      return {
        id: item.Id,
        service: service,
        description: description,
        startTime: item.AFFECT_START_DATE,
        endDate: item.AFFECT_END_DATE,
        priority: priority,
        status: status,
        environment: item.AFFECT_ENVIROMENT || "Producción",
      };
    });
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    return fallbackIncidents;
  }
}

export async function addIncident(incident: Omit<Incident, 'id' | 'status' | 'endDate'>): Promise<Incident> {
  const apiPayload = {
    AFFECT_STATE: 'Abierto',
    AFFECT_DETAILS: `Servicio: ${incident.service} Descripción: ${incident.description}`,
    AFFECT_START_DATE: incident.startTime,
    PERSON_EMAIL: 'user@example.com',
    AFFECT_PRIORITY: incident.priority,
    AFFECT_ENVIRONMENT: incident.environment,
    AFFECT_SERVICE: incident.service,
  };
  
  try {
    const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ef5686f87ba64be5b5eddf78a326b9f9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JNjQ7w17Wf2W6KASNfz0IuKddW_Zd3bSMK8ysI0RZeY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error('La respuesta de la red no fue correcta. Estado:', response.status, 'Cuerpo:', errorBody);
        throw new Error(`La respuesta de la red no fue correcta: ${response.statusText}`);
    }
    
    const createdIncidentFromApi = await response.json(); 

     const newId = createdIncidentFromApi.Id || Math.max(...fallbackIncidents.map(i => i.id)) + 1;
     const createdIncident: Incident = {
        id: newId,
        status: 'Abierto',
        ...incident
     };

    await addIncidentUpdate(createdIncident.id, 'Incidente creado.');

    return createdIncident;
  } catch (error) {
    console.error('Error al crear el incidente:', error);
    const newId = Math.max(...fallbackIncidents.map(i => i.id)) + 1;
    const createdIncident: Incident = {
        id: newId,
        status: 'Abierto',
        ...incident
    };
    fallbackIncidents.unshift(createdIncident);
    addIncidentUpdate(newId, 'Incidente creado.');
    return createdIncident;
  }
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
   const incidents = await getIncidents();
   return incidents.find(incident => incident.id === id);
}

async function getIncidentUpdatesFromApi(incidentId: number): Promise<IncidentUpdate[]> {
    try {
        const response = await fetch(`https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3e000975fbe940c591ac1b834c53d0c2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6_2Ws-GkXV-gq9MAgeQMJ8taCuL8Y7LO6glAOBui3d4`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ AFFECT_Id: incidentId }),
        });
        if (!response.ok) {
            console.warn(`API de actualizaciones falló para el incidente ${incidentId}, usando datos de respaldo.`);
            return fallbackUpdates.filter(update => update.incidentId === incidentId);
        }
        const data = await response.json();
        const updatesData = data.value || [];
        if (!Array.isArray(updatesData)) {
            console.error('La respuesta de la API de actualizaciones no es un array.', data);
            return fallbackUpdates.filter(update => update.incidentId === incidentId);
        }

        // Asumiendo una estructura de API similar a getIncidents
        return updatesData
          .filter((item: any) => item.AFFECT_Id === incidentId)
          .map((item: any): IncidentUpdate => ({
            id: item.Id,
            incidentId: item.AFFECT_Id, // o el campo correcto para el ID del incidente
            text: item.MONITORING_DS, // o el campo correcto para el texto de la actualización
            timestamp: item.MONITORING_DATE, // o el campo correcto para la marca de tiempo
        }));

    } catch (error) {
        console.error(`Error al obtener las actualizaciones del incidente ${incidentId} desde la API:`, error);
        return fallbackUpdates.filter(update => update.incidentId === incidentId);
    }
}


export async function getIncidentUpdates(incidentId: number): Promise<IncidentUpdate[]> {
    // Llama a la nueva función que sabe cómo manejar la respuesta de la API
    return getIncidentUpdatesFromApi(incidentId);
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
            body: JSON.stringify({
              AFFECT_Id: incidentId, // Mapeado al campo esperado por la API
              MONITORING_DS: text,
            }),
        });
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta');
        }
        const createdUpdateFromApi = await response.json();
        return {
            id: createdUpdateFromApi.Id,
            incidentId: incidentId,
            text: text,
            timestamp: new Date().toISOString()
        };

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
        const response = await fetch(`/api/incidents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ AFFECT_STATE: status }),
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
        if (status === 'Cerrado' || status === 'Cerrada') {
          incident.endDate = new Date().toISOString();
        } else {
          incident.endDate = undefined;
        }
        return incident;
    }
}
