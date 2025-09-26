
import { Users, Code, Database, Server, Component, Settings } from 'lucide-react';
import type { ElementType } from "react";
import type { ActividadDefinicion, ActividadMedicion, IniciativaAutomatizacion, ProyectoAutomatizacion, GrupoCelula, ProyectoConNombre, EstadoProyecto } from "./types";


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

export async function getIniciativasAutomatizacion(): Promise<IniciativaAutomatizacion[]> {
    try {
        const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/cdea0d29fc704e4fa03e1774f3caff42/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A82k7X-RyUZ6ZrB_2d3ZZyT4gQBRNexzz6cabnUgiSs');
        if (!response.ok) {
            console.error('La API de iniciativas falló con el estado:', response.status);
            return [];
        }
        const data = await response.json();
        const iniciativasData = data.value || [];

        if (!Array.isArray(iniciativasData)) {
            console.error('La respuesta de la API de iniciativas no es un array.', data);
            return [];
        }

        return iniciativasData.map((item: any): IniciativaAutomatizacion => ({
            id_iniciativa: item.ID,
            id_actividades: item.Id_x0020_ProyectoId ? [item.Id_x0020_ProyectoId] : [],
            nombre_iniciativa: item.Nombre_x0020_Iniciativa || "Iniciativa sin nombre",
            objetivo_iniciativa: item.Objetivo_x0020_Solucion || "No definido",
            alcance: "No definido", // Dato no disponible en la API
            descripcion_problema: "No definido", // Dato no disponible en la API
            solucion_propuesta: item.Solucion_x0020_Planteada || item.Descripcion_x0020_Solucion || "No definida",
            beneficios_esperados: "No definidos", // Dato no disponible en la API
            prioridad: "Media", // Dato no disponible en la API, se usa valor por defecto
            estado: mapEstadoIniciativa(item.Estado),
            responsable_celula: "No definido", // Dato no disponible en la API
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
            nombre_iniciativa: item.Title || `Proyecto #${item.ID}`,
            id_iniciativa: 0, // No disponible en esta API
            fecha_inicio: item.Fecha_x0020_Inicio || new Date(0).toISOString(),
            fecha_fin_estimada: item.Fecha_x0020_Finalizacion || new Date(0).toISOString(),
            responsable_celula: "No definido", // No disponible en la API
            responsable_tecnico: "No definido", // No disponible en la API
            presupuesto_usd: 0, // No disponible en la API
            estado_proyecto: "Planificado", // No disponible en la API
            tecnologia_utilizada: item.Tecnolog_x00ed_a || "No especificada",
            beneficios_estado: item.Beneficios_x0020_Estado || "No definido",
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
