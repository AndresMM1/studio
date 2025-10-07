

import { Users, Code, Database, Server, Component, Settings } from 'lucide-react';
import type { ElementType } from "react";
import type { ActividadDefinicion, ActividadMedicion, IniciativaAutomatizacion, ProyectoAutomatizacion, GrupoCelula, ProyectoConNombre, EstadoProyecto, ServiceDetails } from "./types";
import type { Service } from '../types';


export async function addActividadDefinicion(data: Omit<ActividadDefinicion, 'id_actividad'>): Promise<any> {
  // Simulación: en un caso real, aquí iría la llamada a Power Automate.
  console.log("Creando nueva actividad:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { ...data, id_actividad: Date.now() }; // Retorna el objeto con un ID simulado.
}

export async function updateActividadDefinicion(data: ActividadDefinicion): Promise<any> {
  // Simulación: en un caso real, aquí iría la llamada a Power Automate para actualizar.
  console.log("Actualizando actividad:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return data; // Retorna el objeto actualizado.
}

export async function addActividadMedicion(data: Omit<ActividadMedicion, 'id_medicion'>): Promise<any> {
    const endpoint = 'https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/f8f7dae1c48b40a6b400167efa6e5730/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AWl6LZuFmFGjvkpBALnXK_TJv6SPZU7begukISpvq18';
    
    // Mapeo del objeto 'data' al formato que espera Power Automate
    const apiPayload = {
      id_actividad: parseInt(data.id_actividad.toString(), 10),
      fecha_medicion: data["Fecha Medicion"],
      tipo_medicion: data["Tipo Medicion"],
      seniority_tecnico: parseInt(data["Señority Tecnico"].toString(), 10),
      seniority_operativo: parseInt(data["Señority Operativo"].toString(), 10),
      tiempo_minutos: data["Tiempo Minutos"],
      personas_involucradas: parseInt(data["Involucrados"].toString(), 10),
      frecuencia_cantidad: parseInt(data["Cantidad x Mes"].toString(), 10),
      frecuencia_tipo: data["Unidad Tiempo"],
    };

    console.log("Enviando nueva medición a la API:", apiPayload);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error al crear la medición:', errorBody);
        throw new Error(`Error de red: ${errorBody}`);
    }
    
    // Si la respuesta es 200 OK pero no tiene cuerpo, devolvemos un objeto de éxito.
    // Esto evita el error "Unexpected end of JSON input" si Power Automate responde con un 200 y cuerpo vacío.
    const responseText = await response.text();
    if (responseText) {
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.warn("La respuesta de addActividadMedicion no era un JSON válido, pero la solicitud fue exitosa.", responseText);
            return { success: true, response: responseText };
        }
    }
    
    return { success: true };
}
  
export async function getLatestMedicionForActividad(id_actividad: number): Promise<ActividadMedicion | null> {
    console.log(`Buscando la última medición 'Real' para la actividad ${id_actividad}`);
    const mediciones = await getActividadesMedicion();
    
    const medicionesDeActividad = mediciones
        .filter(m => m.id_actividad === id_actividad && m["Tipo Medicion"] === "Real")
        .sort((a,b) => new Date(b["Fecha Medicion"]).getTime() - new Date(a["Fecha Medicion"]).getTime());

    if (medicionesDeActividad.length > 0) {
        return medicionesDeActividad[0];
    }
    
    console.warn(`No se encontró una medición 'Real' para la actividad ${id_actividad}`);
    return null;
}


export async function addIniciativaAutomatizacion(data: Omit<IniciativaAutomatizacion, 'id_iniciativa'>): Promise<any> {
    console.log("Creando nueva iniciativa:", data);
    // Simulación de la creación de la iniciativa
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newIniciativa = { ...data, id_iniciativa: Date.now() };

    // Lógica para crear mediciones proyectadas si la iniciativa está vinculada a un proyecto
    if (data.id_proyecto && data.id_actividades.length > 0) {
        const proyecto = await getProyectoById(data.id_proyecto);
        if (proyecto) {
            for (const actividadId of data.id_actividades) {
                const latestMedicion = await getLatestMedicionForActividad(actividadId);
                if (latestMedicion) {
                    const newMedicion: Omit<ActividadMedicion, 'id_medicion'> = {
                        ...latestMedicion,
                        "Tipo Medicion": "Proyectada",
                        "Fecha Medicion": new Date().toISOString(),
                        // Aplicar reducciones
                        "Tiempo Minutos": latestMedicion["Tiempo Minutos"] * (1 - (proyecto.varTiempo / 100)),
                        "Involucrados": Math.ceil(latestMedicion["Involucrados"] * (1 - (proyecto.varInvolucrados / 100))),
                        // Aquí podrías agregar más lógica para las otras variables si es necesario
                    };
                    await addActividadMedicion(newMedicion);
                }
            }
        }
    }

    return newIniciativa;
}

export async function updateIniciativaAutomatizacion(data: IniciativaAutomatizacion): Promise<any> {
    console.log("Actualizando iniciativa:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí también se podría añadir la lógica de cálculo si el proyecto se asigna en una actualización
    if (data.id_proyecto && data.id_actividades.length > 0) {
         const proyecto = await getProyectoById(data.id_proyecto);
         if (proyecto) {
             console.log(`Recalculando mediciones para iniciativa ${data.id_iniciativa} con proyecto ${proyecto.titulo}`);
             // La lógica de cálculo iría aquí, similar a `addIniciativaAutomatizacion`
         }
    }

    return data;
}
  
export async function addProyectoAutomatizacion(data: Omit<ProyectoAutomatizacion, 'id_proyecto'>): Promise<any> {
    const endpoint = 'https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/8ad6351f09fa4ab8b8bf9663c04780a3/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oTw9RffikCjmLNyq2j50NBRTCCitqi0l0cgu2yp2Zlc';
    
    const apiPayload = {
        titulo: data.titulo,
        id_iniciativas: [], // Requerido por el schema de Power Automate
        descripcionProblema: data.descripcionProblema,
        objetivo: data.objetivo,
        situacionInicial: data.situacionInicial,
        situacionDeseada: data.situacionDeseada,
        objetivoEspecifico: data.objetivoEspecifico,
        beneficiosEconomicos: data.beneficiosEconomicos,
        beneficiosCliente: data.beneficiosCliente,
        beneficiosColaboradores: data.beneficiosColaboradores,
        datosReferencia: data.datosReferencia,
        conclusiones: data.conclusiones,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        tecnologia: data.tecnologia,
        beneficios_estado: data.beneficios_estado,
        estado_proyecto: data.estado_proyecto,
        varSeniorityTecnico: data.varSeniorityTecnico,
        varSeniorityOperativo: data.varSeniorityOperativo,
        varTiempo: data.varTiempo,
        varInvolucrados: data.varInvolucrados,
        varFrecuencia: data.varFrecuencia,
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error al crear el proyecto:', errorBody);
        throw new Error(`Error de red: ${errorBody}`);
    }
    
    return response.json();
}

export async function updateProyectoAutomatizacion(data: ProyectoAutomatizacion): Promise<any> {
    const endpoint = 'https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/0290d0506ec342289e8829b815409bf0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=khefjDi85GA5weeP_kA5ARI5MagzkHguY7uY0EshaX0';
    
    const apiPayload = {
        ID: data.id_proyecto,
        titulo: data.titulo,
        id_iniciativas: [], // Requerido por el schema de Power Automate
        descripcionProblema: data.descripcionProblema,
        objetivo: data.objetivo,
        situacionInicial: data.situacionInicial,
        situacionDeseada: data.situacionDeseada,
        objetivoEspecifico: data.objetivoEspecifico,
        beneficiosEconomicos: data.beneficiosEconomicos,
        beneficiosCliente: data.beneficiosCliente,
        beneficiosColaboradores: data.beneficiosColaboradores,
        datosReferencia: data.datosReferencia,
        conclusiones: data.conclusiones,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        tecnologia: data.tecnologia,
        beneficios_estado: data.beneficios_estado,
        estado_proyecto: data.estado_proyecto,
        varSeniorityTecnico: data.varSeniorityTecnico,
        varSeniorityOperativo: data.varSeniorityOperativo,
        varTiempo: data.varTiempo,
        varInvolucrados: data.varInvolucrados,
        varFrecuencia: data.varFrecuencia,
    };
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error al actualizar el proyecto:', errorBody);
        throw new Error(`Error de red: ${errorBody}`);
    }
    
    return response.json();
}

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


export async function getActividadesMedicion(): Promise<ActividadMedicion[]> {
    const endpoint = 'https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/6b85c14e3df24cd1b10f4bf64c49d5dc/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TeFQw28QE_qEgYa2ztOrrgTNBcWHcltPnF6atFAHXz4';
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            console.error('La API de mediciones falló con el estado:', response.status);
            return [];
        }
        const data = await response.json();
        const medicionesData = data.value || [];

        if (!Array.isArray(medicionesData)) {
            console.error('La respuesta de la API de mediciones no es un array.', data);
            return [];
        }

        return medicionesData.map((item: any): ActividadMedicion => {
            const tipoMedicion = item.Tipo_x0020_Medicion;
            let mappedTipo: "Real" | "Proyectada" = "Real";
            if (tipoMedicion === "Estimada" || tipoMedicion === "Proyectada") {
                mappedTipo = "Proyectada";
            }

            return {
                id_medicion: item.ID,
                id_actividad: item.Id_x0020_Actividad_x0020_DefinicId,
                "Tipo Medicion": mappedTipo,
                "Fecha Medicion": item.Fecha_x0020_Medicion || new Date().toISOString(),
                "Señority Tecnico": item.Se_x00f1_ority_x0020_Tecnico || 0,
                "Señority Operativo": item.Se_x00f1_ority_x0020_Operativo || 0,
                "Tiempo Minutos": item.Tiempo_x0020_Minutos || 0,
                "Involucrados": item.Involucrados || 0,
                "Cantidad x Mes": item.Cantidad_x0020_x_x0020_Mes || 0,
                "Tiempo x Mes": parseFloat(item.Tiempo_x0020_x_x0020_Mes) || 0,
                "Tiempo Hrs x Mes": parseFloat(item.Tiempo_x0020_Hrs_x0020_x_x0020_M) || 0,
                "Otra Unidad Medida": item.Otra_x0020_Unidad_x0020_Medida || "",
                "Unidad Tiempo": item.Unidad_x0020_Tiempo || "Minutos",
                "Medida": item.Medida || "",
            }
        });

    } catch (error) {
        console.error("Error al obtener las mediciones:", error);
        return [];
    }
}


const grupoIconMap: { [key: number]: ElementType } = {
    1: Users,       // Chapter People
    2: Code,        // Chapter Desarrollo
    3: Database,    // Chapter Data
    4: Server,      // Chapter SRE
    5: Component,   // Chapter Arquitectura
    6: Settings     // Chapter Automatización
};

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

        return gruposData.map((grupo: { ID: number; Title: string; }) => ({
            ...grupo,
            icon: grupoIconMap[grupo.ID] || Users
        }));

    } catch (error) {
        console.error("Error al obtener los grupos de célula:", error);
        return [];
    }
}

const mapEstadoIniciativa = (estado: string | null): EstadoIniciativa => {
    switch (estado) {
        case "SI": return "Aprobada";
        case "NO": return "Rechazada";
        default: return "Propuesta";
    }
};

async function getIniciativaActividadLinks(): Promise<Map<number, number[]>> {
    const linksMap = new Map<number, number[]>();
    try {
        const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/897f219c997040eab1ef511676088e88/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=F__TEB918blfCn7GGQJeEVu2v8q5tRwwG9Jz4P6ZnOs');
        if (!response.ok) {
            console.error('La API de enlaces iniciativa-actividad falló:', response.status);
            return linksMap;
        }
        const data = await response.json();
        const linksData = data.value || [];

        if (!Array.isArray(linksData)) {
            console.error('La respuesta de la API de enlaces no es un array.', data);
            return linksMap;
        }

        for (const link of linksData) {
            const iniciativaId = link["Id_x0020_IniciativaId"];
            const actividadId = link["Id_x0020_Actividad_x0020_DefinicId"];
            if (!linksMap.has(iniciativaId)) {
                linksMap.set(iniciativaId, []);
            }
            linksMap.get(iniciativaId)?.push(actividadId);
        }

    } catch (error) {
        console.error("Error al obtener los enlaces iniciativa-actividad:", error);
    }
    return linksMap;
}

export async function getIniciativasAutomatizacion(): Promise<IniciativaAutomatizacion[]> {
    try {
        const [iniciativasResponse, linksMap] = await Promise.all([
            fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/cdea0d29fc704e4fa03e1774f3caff42/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A82k7X-RyUZ6ZrB_2d3ZZyT4gQBRNexzz6cabnUgiSs'),
            getIniciativaActividadLinks()
        ]);

        if (!iniciativasResponse.ok) {
            console.error('La API de iniciativas falló con el estado:', iniciativasResponse.status);
            return [];
        }
        const data = await iniciativasResponse.json();
        const iniciativasData = data.value || [];

        if (!Array.isArray(iniciativasData)) {
            console.error('La respuesta de la API de iniciativas no es un array.', data);
            return [];
        }

        return iniciativasData.map((item: any): IniciativaAutomatizacion => ({
            id_iniciativa: item.ID,
            id_proyecto: item.Id_x0020_ProyectoId,
            id_actividades: linksMap.get(item.ID) || [],
            nombre_iniciativa: item.Nombre_x0020_Iniciativa || "Iniciativa sin nombre",
            objetivo_iniciativa: item.Objetivo_x0020_Solucion || "No definido",
            alcance: "No definido", 
            descripcion_problema: "No definido", 
            solucion_propuesta: item.Solucion_x0020_Planteada || item.Descripcion_x0020_Solucion || "No definida",
            beneficios_esperados: "No definidos", 
            prioridad: "Media", 
            estado: mapEstadoIniciativa(item.Estado),
            responsable_celula: "No definido", 
        }));
    } catch (error) {
        console.error("Error al obtener las iniciativas:", error);
        return [];
    }
}


export async function getProyectosAutomatizacion(): Promise<ProyectoConNombre[]> {
    try {
        const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/5f7a21bba65d47119d4b909be9a98889/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Gvzl4O3H20UWyLprc2n-9OdW6TWv5GtX-bJsSxDFycQ');
        if (!response.ok) {
            console.error('La API de proyectos falló con el estado:', response.status);
            return [];
        }
        const data = await response.json();
        const proyectosData = data.value || [];

        if (!Array.isArray(proyectosData)) {
            console.error('La respuesta de la API de proyectos no es un array.', data);
            return [];
        }

        return proyectosData.map((item: any): ProyectoConNombre => ({
            id_proyecto: item.ID,
            titulo: item.Title || `Proyecto #${item.ID}`,
            nombre_iniciativa: item.Title || `Proyecto #${item.ID}`, // Compatibilidad
            
            descripcionProblema: item.Resumen, // Asumiendo que 'Resumen' es 'Descripcion Problema'
            objetivo: item.Objetivo,
            situacionInicial: item.Situacion_x0020_Inicial,
            situacionDeseada: item.Situacion_x0020_Deseada,
            objetivoEspecifico: item.Objetivo_x0020_especifico,
            beneficiosEconomicos: item.Beneficios_x0020_Economicos,
            beneficiosCliente: item.Beneficios_x0020_Cliente,
            beneficiosColaboradores: item.Beneficios_x0020_Colaboradores,
            datosReferencia: item.Datos_x0020_Referencia,
            conclusiones: item.Conclusiones,

            fecha_inicio: item.Fecha_x0020_Inicio || new Date().toISOString(),
            fecha_fin: item.Fecha_x0020_Finalizacion || new Date().toISOString(),
            estado_proyecto: "Planificado", // No viene de la API
            tecnologia: item.Tecnolog_x00ed_a,
            beneficios_estado: item.Beneficios_x0020_Estado,

            varSeniorityTecnico: item.Var_x0020_Se_x00f1_ority_x0020_T || 0,
            varSeniorityOperativo: item.Var_x0020_Se_x00f1_ority_x0020_O || 0,
            varTiempo: item.Var_x0020_Tiempo || 0,
            varInvolucrados: item.Var_x0020_Involucrados || 0,
            varFrecuencia: item.Var_x0020_Frecuencia || 0,
        }));
    } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        return [];
    }
}

export async function getProyectoById(id: number): Promise<ProyectoConNombre | undefined> {
    const proyectos = await getProyectosAutomatizacion();
    return proyectos.find(p => p.id_proyecto === id);
}

// Mock data for a single service, as there's no API for it yet.
export const mockServiceDetails: ServiceDetails[] = [
    {
        id: 1,
        name: "API de Facturación",
        description: "Servicio encargado de la generación y gestión de facturas para clientes. Se integra con sistemas contables y de pago.",
        purpose: "Centralizar y automatizar todo el ciclo de vida de la facturación, desde la creación hasta el registro del pago, asegurando la consistencia y reduciendo errores manuales.",
        failureImpact: "La facturación se detiene, afectando directamente el flujo de caja de la empresa. Los clientes no pueden recibir sus facturas, lo que genera retrasos en los pagos e insatisfacción.",
        owner: "Equipo Core",
        squad: "Finanzas Tech",
        contacts: {
            technicalLead: { name: "Ana Torres", email: "atorres@example.com" },
            productOwner: { name: "Carlos Luna", email: "cluna@example.com" },
        },
        repositories: [
            { name: "billing-api", url: "https://github.com/example/billing-api" },
            { name: "billing-frontend", url: "https://github.com/example/billing-frontend" },
        ],
        technologies: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "Kubernetes"],
        cloudInfrastructure: {
            provider: "GCP",
            region: "us-central1",
            resources: [
                { type: "GKE Cluster", name: "main-cluster" },
                { type: "Cloud SQL", name: "billing-db-instance" },
                { type: "Cloud Storage", name: "billing-assets-bucket" },
            ],
        },
        diagrams: [
            { name: "Diagrama de Arquitectura", url: "https://picsum.photos/seed/arch1/800/600" },
            { name: "Flujo de Datos", url: "https://picsum.photos/seed/flow1/800/600" },
        ]
    },
    {
        id: 2,
        name: "Servicio de Autenticación",
        description: "Gestiona el inicio de sesión, registro y tokens de acceso para todas las aplicaciones de la plataforma.",
        purpose: "Proveer un punto único y seguro para la gestión de identidades y accesos, protegiendo las cuentas de los usuarios y los recursos de la plataforma.",
        failureImpact: "Los usuarios no pueden iniciar sesión ni registrarse en ninguna aplicación. Las sesiones activas podrían expirar sin posibilidad de renovación, bloqueando el acceso a toda la plataforma.",
        owner: "Equipo de Plataforma",
        squad: "Identidad",
        contacts: {
          technicalLead: { name: "David Chen", email: "dchen@example.com" },
          productOwner: { name: "Eva Martinez", email: "emartinez@example.com" },
        },
        repositories: [
          { name: "auth-service", url: "https://github.com/example/auth-service" },
        ],
        technologies: ["Go", "gRPC", "OAuth 2.0", "JWT", "Redis"],
        cloudInfrastructure: {
            provider: "AWS",
            region: "us-east-1",
            resources: [
                { type: "EKS Cluster", name: "platform-cluster" },
                { type: "ElastiCache", name: "auth-redis-cache" },
            ],
        },
        diagrams: [
            { name: "Diagrama de Flujo de Autenticación", url: "https://picsum.photos/seed/authflow/800/600" },
        ]
      }
];

export async function getServiceById(id: number, services: Service[]): Promise<ServiceDetails | undefined> {
    // Find the basic service info from the API list
    const serviceInfo = services.find(s => s.ID === id);
    if (!serviceInfo) {
        // If not in the main list, maybe it's a mock-only service id
        const mockOnlyService = mockServiceDetails.find(d => d.id === id);
        if (mockOnlyService) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return mockOnlyService;
        }
        return undefined;
    }

    // Find specific mock details for this service
    let details = mockServiceDetails.find(d => d.id === id);

    // If no specific mock data, use the first mock as a template but with correct info
    if (!details) {
        const fallbackDetails = { ...mockServiceDetails[0] }; // Clone the template
        details = {
            ...fallbackDetails,
            id: serviceInfo.ID,
            name: serviceInfo.SERVICE_NAME,
            description: `Descripción para el servicio ${serviceInfo.SERVICE_NAME}.`,
        };
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return details;
}
    

    

    

    

    
