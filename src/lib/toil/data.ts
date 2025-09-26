
import { Users, Code, Database, Server, Component, Settings } from 'lucide-react';
import type { ElementType } from "react";
import type { ActividadDefinicion, ActividadMedicion, IniciativaAutomatizacion, ProyectoAutomatizacion, GrupoCelula, ProyectoConNombre } from "./types";


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
