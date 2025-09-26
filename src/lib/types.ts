export type IncidentPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type IncidentStatus = "Proceso" | "En espera" | "Cerrado" | "Cerrada";
import type { ElementType } from "react";

export interface IncidentUpdate {
  id: number;
  incidentId: number;
  text: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  service: string;
  startTime: string; 
  endDate?: string; 
  description: string;
  priority: IncidentPriority;
  environment: string;
  status: IncidentStatus;
}

export interface Service {
  ID: number;
  SERVICE_NAME: string;
}

export interface ServiceApiResponse {
  value: Service[];
}

export interface User {
  name: string;
  email: string;
}
export type Impacto = "Bajo" | "Medio" | "Alto";
export type Complejidad = "Baja" | "Media" | "Alta";
export type FrecuenciaMedicion = "Diaria" | "Semanal" | "Mensual" | "Bimestral" | "Trimestral" | "Semestral" | "Anual";
export type PrioridadIniciativa = "Baja" | "Media" | "Alta" | "Crítica";
export type EstadoIniciativa = "Propuesta" | "Aprobada" | "Rechazada" | "En progreso";
export type EstadoProyecto = "Planificado" | "En Ejecución" | "Finalizado" | "En Pausa" | "Cancelado";


// Corresponde a la tabla: ACTIVIDAD_DEFINICION
export interface ActividadDefinicion {
  id_actividad: number;
  id_grupo_celula: number;
  actividad_practica: string;
  actividad_detalle: string;
  origen_operacion: string;
  origen_alcance: string;
  impacto_negocio_desc: string;
  impacto_operacion_desc: string;
  impacto_negocio: number | Impacto;
  impacto_operacion: number | Impacto;
  complejidad_ejecucion: Complejidad;
  automatizable: boolean;
  es_toil: boolean;
}

// Corresponde a la tabla: ACTIVIDAD_MEDICION
export interface ActividadMedicion {
    id_medicion: number;
    id_actividad: number;
    fecha_medicion: string;
    frecuencia: FrecuenciaMedicion;
    tiempo_manual_horas: number;
    cantidad_personas: number;
}


// Corresponde a la tabla: INICIATIVA_AUTOMATIZACION
export interface IniciativaAutomatizacion {
  id_iniciativa: number;
  id_actividades: number[];
  nombre_iniciativa: string;
  objetivo_iniciativa: string;
  alcance: string;
  descripcion_problema: string;
  solucion_propuesta: string;
  beneficios_esperados: string;
  prioridad: PrioridadIniciativa;
  estado: EstadoIniciativa;
  responsable_celula: string;
}

// Corresponde a la tabla: PROYECTOS_AUTOMATIZACION
export interface ProyectoAutomatizacion {
    id_proyecto: number;
    id_iniciativa: number;
    fecha_inicio: string;
    fecha_fin_estimada: string;
    responsable_celula: string;
    responsable_tecnico: string;
    presupuesto_usd: number;
    estado_proyecto: EstadoProyecto;
    url_documentacion?: string;
    tecnologia_utilizada: string;
    beneficios_estado: string;
}
export interface GrupoCelula {
  ID: number;
  Title: string;
  icon?: ElementType;

}