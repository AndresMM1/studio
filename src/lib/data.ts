import type { Incident, IncidentStatus, IncidentUpdate, IncidentPriority } from "./types";

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
       console.error('La API de incidentes falló con el estado:', response.status);
      return [];
    }
    const data = await response.json();

    const incidentsData = data.value || [];

    if (!Array.isArray(incidentsData)) {
      console.error('La respuesta de la API de incidentes no es un array y no se pudo encontrar un array de incidentes en el objeto de respuesta.', data);
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

      let status: Incident["status"] = "Proceso";
       if(item.AFFECT_STATE) {
          const s = item.AFFECT_STATE.charAt(0).toUpperCase() + item.AFFECT_STATE.slice(1).toLowerCase();
          if (s === "Proceso" || s === "En espera" || s === "Cerrado" || s === "Cerrada") {
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
    return [];
  }
}

export async function addIncident(incident: Omit<Incident, 'id' | 'status' | 'endDate'>): Promise<Incident> {
  const apiPayload = {
    AFFECT_STATE: 'Proceso',
    AFFECT_DETAILS: `Servicio: ${incident.service} Descripción: ${incident.description}`,
    AFFECT_START_DATE: incident.startTime,
    PERSON_EMAIL: 'prv_amora@avalvc.com.co',
    AFFECT_PRIORITY: incident.priority,
    AFFECT_ENVIRONMENT: incident.environment,
    AFFECT_SERVICE: incident.service,
  };
  
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

   const newId = createdIncidentFromApi.Id || Date.now();
   const createdIncident: Incident = {
      id: newId,
      status: 'Proceso',
      ...incident
   };

  await addIncidentUpdate(createdIncident.id, 'Incidente creado.');

  return createdIncident;
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
   const incidents = await getIncidents();
   return incidents.find(incident => incident.id === id);
}

async function getIncidentUpdatesFromApi(incidentId: number): Promise<IncidentUpdate[]> {
    try {
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3e000975fbe940c591ac1b834c53d0c2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6_2Ws-GkXV-gq9MAgeQMJ8taCuL8Y7LO6glAOBui3d4', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Id: incidentId }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API de actualizaciones falló para el incidente ${incidentId}. Estado: ${response.status}`, errorBody);
            return [];
        }

        const data = await response.json();
        const updatesData = data.body.value || [];
        if (!Array.isArray(updatesData)) {
            console.error('La respuesta de la API de actualizaciones no es un array.', data);
            return [];
        }

        // Map API response to IncidentUpdate[]
        return updatesData.map((item: any): IncidentUpdate => ({
            id: item.ID,
            incidentId: item.AFFECT_ID,
            text: item.MONITORING_DS,
            timestamp: item.MONITORING_DATE,
        }));

    } catch (error) {
        console.error(`Error al obtener las actualizaciones del incidente ${incidentId} desde la API:`, error);
        return [];
    }
}


export async function getIncidentUpdates(incidentId: number): Promise<IncidentUpdate[]> {
    return getIncidentUpdatesFromApi(incidentId);
}


export async function addIncidentUpdate(incidentId: number, text: string): Promise<IncidentUpdate> {
    const timestamp = new Date().toISOString();
    const newUpdateData = {
        AFFECT_ID: incidentId.toString(),
        MONITORING_DATE: timestamp,
        MONITORING_DS: text,
    };
    try {
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c33e8022de504514bdf4eed5e3cd7411/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=o0Y7Zo8h7qLfiHkHReujjzOSInYf26drDXb2--cEIS8', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUpdateData),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error al agregar la actualización del incidente. Estado:', response.status, 'Cuerpo:', errorBody);
            throw new Error(`La respuesta de la red no fue correcta: ${response.statusText}`);
        }
        const createdUpdateFromApi = await response.json();
        return {
            id: createdUpdateFromApi.Id || Date.now(),
            incidentId: incidentId,
            text: text,
            timestamp: timestamp
        };

    } catch (error) {
        console.error('Error al agregar la actualización del incidente:', error);
        throw error;
    }
}


export async function updateIncidentStatus(id: number, status: IncidentStatus): Promise<Incident | undefined> {
    try {
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/de3848599ca64772bf8276fb184bf3e8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ps36EfLEFdAquzTqd-tgdR-FbNXsD-cG66FD-o5R_rM', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Id: id, Estado: status }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error al actualizar el estado del incidente. Estado:', response.status, 'Cuerpo:', errorBody);
            throw new Error(`La respuesta de la red no fue correcta: ${response.statusText}`);
        }
        // Assuming the API returns the updated incident, but if not, we can refetch or just confirm success
        // For now, we will fetch the incident again to ensure we have the latest data.
        const updatedIncident = await getIncidentById(id);
        return updatedIncident;

    } catch (error) {
        console.error('Error al actualizar el estado del incidente:', error);
        return undefined;
    }
}
