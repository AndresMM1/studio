import type { Incident, IncidentStatus, IncidentUpdate, Service, ServiceApiResponse, ClosureData } from "./types";
import { sendWhatsAppGroupMessage } from "./notifications";

export async function getServices(): Promise<Service[]> {
    try {
        const response = await fetch('https://045498d8c2eae9f4994f58cd02cb99.e0.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/04b1144263da4f43a8073aac608d2cb2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=H8Dkdab2KfRMjcnNndqj3Y3-cukCBotl7JYnTZURPes');
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
            if (item.AFFECT_PRIORITY) {
                const p = item.AFFECT_PRIORITY.charAt(0).toUpperCase() + item.AFFECT_PRIORITY.slice(1).toLowerCase();
                if (p === "Crítica" || p === "Alta" || p === "Media" || p === "Baja") {
                    priority = p;
                }
            }

            let status: Incident["status"] = "Proceso";
            if (item.AFFECT_STATE) {
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
    console.log("Create Incident API Response:", createdIncidentFromApi);

    let newIncidentId;

    // Handle case where response is { CreatedID: "..." } directly
    if (createdIncidentFromApi.CreatedID) {
        newIncidentId = createdIncidentFromApi.CreatedID;
    }
    // Handle legacy/alternative case where response is { Incident: "{\"CreatedID\":\"...\"}" }
    else if (createdIncidentFromApi.Incident && typeof createdIncidentFromApi.Incident === 'string') {
        const incidentData = JSON.parse(createdIncidentFromApi.Incident);
        console.log("Parsed Incident Data:", incidentData);
        newIncidentId = incidentData.CreatedID;
    } else {
        console.error("Unexpected API response format:", createdIncidentFromApi);
        throw new Error("API response did not contain a valid CreatedID.");
    }

    if (!newIncidentId) {
        console.error("Missing CreatedID in parsed data:", createdIncidentFromApi);
        throw new Error("Parsed incident data did not contain a CreatedID.");
    }

    // Construct the new incident object locally instead of fetching it
    // This avoids race conditions where the API hasn't indexed the new item yet
    const newIncident: Incident = {
        id: parseInt(newIncidentId, 10),
        service: incident.service,
        description: incident.description,
        startTime: incident.startTime,
        endDate: undefined,
        priority: incident.priority,
        status: 'Proceso',
        environment: incident.environment,
        teamsLink: incident.teamsLink
    };


    try {
        const md = `**Nuevo incidente creado**\n\n**ID:** ${newIncident.id}\n**Servicio:** ${newIncident.service}\n**Prioridad:** ${newIncident.priority}\n**Descripción:**\n${newIncident.description}\n**Inicio:** ${newIncident.startTime}`;
        sendWhatsAppGroupMessage(md).catch((err) => console.error('WhatsApp send failed (create incident):', err));
    } catch (e) {
        console.error('Failed to prepare WhatsApp message for new incident:', e);
    }

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
        const updateObj: IncidentUpdate = {
            id: createdUpdateFromApi.Id || Date.now(),
            incidentId: parseInt(incidentId, 10),
            text: text,
            timestamp: timestamp
        };

        // Send WhatsApp notification for the update (fire-and-forget)
        try {
            const md = `**Actualización de incidente**\n\n**ID:** ${incidentId}\n**Mensaje:**\n${text}\n**Timestamp:** ${timestamp}`;
            sendWhatsAppGroupMessage(md).catch((err) => console.error('WhatsApp send failed (incident update):', err));
        } catch (e) {
            console.error('Failed to prepare WhatsApp message for incident update:', e);
        }

        return updateObj;

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
        // Notify via WhatsApp about the status change (fire-and-forget)
        try {
            const md = `**Estado de incidente actualizado**\n\n**ID:** ${id}\n**Nuevo Estado:** ${status}`;
            sendWhatsAppGroupMessage(md).catch((err) => console.error('WhatsApp send failed (status change):', err));
        } catch (e) {
            console.error('Failed to prepare WhatsApp message for status change:', e);
        }
        return updatedIncident;

    } catch (error) {
        console.error('Error al actualizar el estado del incidente:', error);
        return undefined;
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
        generatedAlerts: data.generatedAlerts ? "Sí" : "No",
        docResponsible: data.docResponsible,
        domainResponsible: data.domainResponsible,
        initialAnalysis: data.initialAnalysis,
        rootCause: data.rootCause,
        causeCategory: data.causeCategory,
        rootCauseIdentified: data.rootCauseIdentified ? "Sí" : "No",
        repetitiveIncident: data.repetitiveIncident ? "Sí" : "No",
        solutionActivities: data.solutionActivities,
        actionPlans: data.actionPlans,
        asdResponsible: data.asdResponsible,
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
        // Send WhatsApp notification about incident closure (fire-and-forget)
        try {
            const md = `**Cierre de incidente**\n\n**ID:** ${data.incidentId}\n**Servicio:** ${data.service}\n**Inicio:** ${data.startTime}\n**Fin:** ${data.endTime}\n**Solución:**\n${data.solution}`;
            sendWhatsAppGroupMessage(md).catch((err) => console.error('WhatsApp send failed (closure docs):', err));
        } catch (e) {
            console.error('Failed to prepare WhatsApp message for incident closure:', e);
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
