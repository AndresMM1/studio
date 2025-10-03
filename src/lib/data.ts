import type { Incident, IncidentStatus, IncidentUpdate, Service, ServiceApiResponse, ActividadDefinicion, ActividadMedicion, IniciativaAutomatizacion, ProyectoAutomatizacion ,GrupoCelula,ClosureData} from "./types";
import { Users, Code, Database, Server, Component, Settings } from 'lucide-react';
import type { ElementType } from "react";

type ProyectoConNombre = ProyectoAutomatizacion & { nombre_iniciativa: string };
function parseAffectDetails(details: string): { service: string; description: string } {
  const serviceMatch = details.match(/Servicio:\s*(.*?)\s*Descripción:/);
  const descriptionMatch = details.match(/Descripción:\s*(.*)/);

  const service = serviceMatch ? serviceMatch[1].trim() : "N/A";
  const description = descriptionMatch ? descriptionMatch[1].trim() : details;

  return { service, description };
}

export async function getServices(): Promise<Service[]> {
    try {
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/a567f422ff1e4c5c9467fae1912dde4a/triggers/manual/paths/invoke/?api-version=1&tenantId=tId&environmentId=045498d8-c2ea-e9f4-994f-58cd02cb99e0&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UUSBLv0BTlB4DtDpw6ZmI5TX8u4G6-6AGDLIHMK2YyI');
        if (!response.ok) {
            console.error('La API de servicios falló con el estado:', response.status);
            return [];
        }
        const data: ServiceApiResponse = await response.json();
        
        const servicesData = data.value || [];

        if (!Array.isArray(servicesData)) {
            console.error('La respuesta de la API de servicios no es un array y no se pudo encontrar un array de servicios en el objeto de respuesta.', data);
            return [];
        }

        return servicesData;

    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        return [];
    }
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
        service: item.AFFECT_SERVICE || "N/A",
        description: item.AFFECT_DETAILS || "",
        startTime: item.AFFECT_START_DATE,
        endDate: item.AFFECT_END_DATE,
        priority: priority,
        status: status,
        environment: item.AFFECT_ENVIROMENT || "Producción",
        teamsLink: item.AFFECT_LINK,
      };
    });
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    return [];
  }
}

export async function addIncident(incident: Omit<Incident, 'id' | 'status' | 'endDate'>, userEmail: string): Promise<Incident> {
  const apiPayload = {
    AFFECT_STATE: 'Proceso',
    AFFECT_DETAILS: incident.description,
    AFFECT_START_DATE: incident.startTime,
    PERSON_EMAIL: userEmail,
    AFFECT_PRIORITY: incident.priority,
    AFFECT_ENVIRONMENT: incident.environment,
    AFFECT_SERVICE: incident.service,
    AFFECT_LINK: incident.teamsLink || ''
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

  console.log("API Response for Create Incident:", JSON.stringify(createdIncidentFromApi, null, 2));

  // The API returns the full incident object, let's use it directly.
  // We'll parse it just like we do in getIncidents to ensure consistency.
  const newIncidentId = createdIncidentFromApi.CreatedID;
  if (!newIncidentId) {
    throw new Error("API response did not contain a CreatedID.");
  }

  // Fetch the full incident details using the new ID
  const newIncident = await getIncidentById(newIncidentId);
  if (!newIncident) {
    // Optional: Add retry logic here if needed, or just throw
    throw new Error(`Failed to fetch newly created incident with ID: ${newIncidentId}`);
  }

  await addIncidentUpdate(newIncident.id.toString(), 'Incidente creado.');

  return newIncident;
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
        const updatesData = data.value || [];
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


export async function addIncidentUpdate(incidentId: string, text: string): Promise<IncidentUpdate> {
    const timestamp = new Date().toISOString();
    const newUpdateData = {
        AFFECT_ID: incidentId.toString( ),
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
            incidentId: parseInt(incidentId, 10),
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
        
        const updatedIncident = await getIncidentById(id);
        return updatedIncident;

    } catch (error) {
        console.error('Error al actualizar el estado del incidente:', error);
        return undefined;
    }
}

export async function addActividadDefinicion(data: Omit<ActividadDefinicion, 'id_actividad'>): Promise<any> {
  const response = await fetch('https://your-power-automate-url-for-actividad-definicion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error al crear la actividad: ${errorBody}`);
  }

  return response.json();
}

export async function addActividadMedicion(data: Omit<ActividadMedicion, 'id_medicion'>): Promise<any> {
    const response = await fetch('https://your-power-automate-url-for-actividad-medicion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error al guardar la medición: ${errorBody}`);
    }
  
    return response.json();
  }
  
  export async function addIniciativaAutomatizacion(data: Omit<IniciativaAutomatizacion, 'id_iniciativa'>): Promise<any> {
    const response = await fetch('https://your-power-automate-url-for-iniciativa-automatizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error al crear la iniciativa: ${errorBody}`);
    }
  
    return response.json();
  }
  
  export async function addProyectoAutomatizacion(data: Omit<ProyectoAutomatizacion, 'id_proyecto'>): Promise<any> {
    const response = await fetch('https://your-power-automate-url-for-proyecto-automatizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error al crear el proyecto: ${errorBody}`);
    }
  
    return response.json();
  }

// --- TOIL Mock Data / API ---
const mapImpactoToLabel = (value: number | string): "Bajo" | "Medio" | "Alto" => {
    const numValue = Number(value);
    if (numValue >= 7) return "Alto";
    if (numValue >= 4) return "Medio";
    return "Bajo";
};

const mapActividadPractica = (id: number): string => {
    switch (id) {
        case 84: return "gestion-incidentes";
        case 85: return "desarrollo-software";
        case 86: return "analisis-datos";
        default: return "desconocido";
    }
};

export async function getActividadesDefinicion(): Promise<ActividadDefinicion[]> {
    try {
        const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/f76a179941e14d1fb659f63f4af18bec/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=H2C7elq0nxSYNdMjzC-JHCEjUyzFdEUlK2ZTBfjJoBA');
        if (!response.ok) {
            console.error('La API de actividades falló con el estado:', response.status);
            return [];
        }
        const data = await response.json();
        const actividadesData = data.value || [];

        if (!Array.isArray(actividadesData)) {
            console.error('La respuesta de la API de actividades no es un array.', data);
            return [];
        }

        return actividadesData.map((item: any): ActividadDefinicion => ({
            id_actividad: item.ID,
            id_grupo_celula: item.Id_x0020_Grupo_Celula_ChapterId || 0,
            actividad_practica: mapActividadPractica(item.Id_x0020_Actividad_x0020_PracticId),
            actividad_detalle: item.Actividad_x0020_Detalle || "N/A",
            origen_operacion: item.Origen_x0020_Operacion || "N/A",
            origen_alcance: item.Origen_x0020_Alcance || "N/A",
            impacto_negocio_desc: item.Impacto_x0020_Negocio_x0020_Desc || "N/A",
            impacto_operacion_desc: item.Impacto_x0020_Operacion_x0020_De || "N/A",
            impacto_negocio: item.Impacto_x0020_Negocio || 0,
            impacto_operacion: item.Impacto_x0020_Operacion || 0,
            complejidad_ejecucion: item.Complejidad_x0020_Ejecucion || "Baja",
            automatizable: item.Automatizable || false,
            es_toil: item.Toil || false,
        }));
    } catch (error) {
        console.error("Error al obtener las actividades:", error);
        return [];
    }
}

const mockIniciativas: IniciativaAutomatizacion[] = [
    { id_iniciativa: 1, id_actividades: [1], nombre_iniciativa: "Automatización de Análisis de Logs con Elastic", objetivo_iniciativa: "Reducir el tiempo de análisis de logs en un 90%.", alcance: "Implementar un dashboard en Kibana para visualizar errores comunes.", descripcion_problema: "La revisión manual es lenta y propensa a errores.", solucion_propuesta: "Usar Filebeat para enviar logs a Elasticsearch y crear dashboards.", beneficios_esperados: "Ahorro de 3.5 horas por incidente, resolución más rápida.", prioridad: "Alta", estado: "Aprobada", responsable_celula: "Célula SRE" },
    { id_iniciativa: 2, id_actividades: [2], nombre_iniciativa: "Reporte automático de Cobertura con SonarQube", objetivo_iniciativa: "Generar y enviar el reporte de cobertura automáticamente tras cada build.", alcance: "Integrar SonarQube con el pipeline de CI/CD.", descripcion_problema: "El reporte manual se olvida o se hace de forma inconsistente.", solucion_propuesta: "Configurar webhook en Jenkins para ejecutar análisis de SonarQube.", beneficios_esperados: "Ahorro de 2 horas semanales y visibilidad constante.", prioridad: "Media", estado: "Propuesta", responsable_celula: "Chapter de Frontend" },
];

const mockProyectos: ProyectoAutomatizacion[] = [
    { id_proyecto: 1, id_iniciativa: 1, fecha_inicio: "2024-07-01", fecha_fin_estimada: "2024-08-15", responsable_celula: "Célula SRE", responsable_tecnico: "Juan Pérez", presupuesto_usd: 5000, estado_proyecto: "En Ejecución", url_documentacion: "https://confluence.example.com/elastic-project", tecnologia_utilizada: "Elasticsearch, Kibana, Filebeat", beneficios_estado: "En desarrollo. Se espera un ahorro de 14 horas/mes." },
    { id_proyecto: 2, id_iniciativa: 2, fecha_inicio: "2024-09-01", fecha_fin_estimada: "2024-09-30", responsable_celula: "Chapter de Frontend", responsable_tecnico: "Ana Gómez", presupuesto_usd: 2500, estado_proyecto: "Planificado", url_documentacion: "https://confluence.example.com/sonarqube-project", tecnologia_utilizada: "SonarQube, Jenkins", beneficios_estado: "Pendiente de inicio." },
];

export async function getIniciativasAutomatizacion(): Promise<IniciativaAutomatizacion[]> {
    return Promise.resolve(mockIniciativas);
}

export async function getProyectosAutomatizacion(): Promise<ProyectoConNombre[]> {
    
    const proyectosConNombres = mockProyectos.map(proyecto => {
        const iniciativa = mockIniciativas.find(i => i.id_iniciativa === proyecto.id_iniciativa);
        return {
            ...proyecto,
            nombre_iniciativa: iniciativa ? iniciativa.nombre_iniciativa : "Iniciativa no encontrada",
        };
    });

    return Promise.resolve(proyectosConNombres);
}

export async function getProyectoById(id: number): Promise<ProyectoConNombre | undefined> {
    const proyectos = await getProyectosAutomatizacion();
    return proyectos.find(p => p.id_proyecto === id);
}

    

    export async function getGruposCelula(): Promise<GrupoCelula[]> {
    try {
        const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/b0efb844dc1847fe99fae7983095a17b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=APZ908nzc7TUqNhXzVUBYDXmEVi0OUmpmmA3KZ_um5c');
        if (!response.ok) {
            console.error('La API de grupos de célula falló con el estado:', response.status);
            return [];
        }
        const data = await response.json();
        const gruposData = data.value || [];

        if (!Array.isArray(gruposData)) {
            console.error('La respuesta de la API de grupos de célula no es un array.', data);
            return [];
        }

        return gruposData;
    } catch (error) {
        console.error("Error al obtener los grupos de célula:", error);
        return [];
    }
}
export async function sendClosureDocumentation(data: ClosureData): Promise<void> {
    const apiPayload = {
       incidentId: data.incidentId,
        startTime: data.startTime,
        endTime: data.endTime,
        service: data.service,
        description: data.description,
        solution: data.solution,
        generatedAlerts: data.generatedAlerts? "Sí" : "No",
        docResponsible: data.docResponsible,
        domainResponsible: data.domainResponsible,
    };
    try {
        // NOTE: Replace with the actual documentation endpoint URL
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/45310103ab6d4cc18942218058bdf454/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KAaT25wLBOqTuOFlnkmdPmTtTA5j-_sGAJzfpixk74c', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
            throw new Error('Failed to send closure documentation');
        }
    } catch (error) {
        console.error("Error sending closure documentation:", error);
        throw error;
    }
}

export async function generateTeamsMeetingLink(serviceName: string): Promise<string> {
    // IMPORTANT: Replace with your actual API endpoint for generating a Teams link
    const TEAMS_LINK_ENDPOINT = 'https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/f30c59b512a143feb378af616fbccd1b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dve5mMpvN9aVfh90IAPd3vm0d-FnA8Qcea6frrmcbGM';
    try {
        const response = await fetch(TEAMS_LINK_ENDPOINT, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ service: serviceName }) // Pass service name in the body
        });
        if (!response.ok) {
            throw new Error('Failed to generate Teams meeting link');
        }
        const data = await response.json();
        // Assuming the API returns a JSON object like { "link": "https://teams.microsoft.com/..." }
        if (!data.link) {
            throw new Error('API response did not contain a link.');
        }
        return data.link;
    } catch (error) {
        console.error("Error generating Teams link:", error);
        throw error;
    }
}
