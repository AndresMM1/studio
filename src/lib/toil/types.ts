
import type { ElementType } from "react";
import type { Incident, IncidentUpdate } from "../types";

export type Complejidad = "Baja" | "Media" | "Alta";
export type FrecuenciaMedicion = "Diaria" | "Semanal" | "Mensual" | "Bimestral" | "Trimestral" | "Semestral" | "Anual";
export type PrioridadIniciativa = "Baja" | "Media" | "Alta" | "Crítica";
export type EstadoIniciativa = "Propuesta" | "Aprobada" | "Rechazada" | "En progreso";
export type EstadoProyecto = "Planificado" | "En Ejecución" | "Finalizado" | "En Pausa" | "Cancelado";


export interface GrupoCelula {
  ID: number;
  Title: string;
  icon?: ElementType;
}

export interface ActividadDefinicion {
  id_actividad: number;
  id_grupo_celula: number;
  actividad_practica: string;
  actividad_detalle: string;
  origen_operacion: string;
  origen_alcance: string;
  impacto_negocio_desc: string;
  impacto_operacion_desc: string;
  impacto_negocio: number;
  impacto_operacion: number;
  complejidad_ejecucion: Complejidad;
  automatizable: boolean;
  es_toil: boolean;
}

export interface ActividadMedicion {
    id_medicion: number;
    id_actividad: number;
    fecha_medicion: string;
    frecuencia: FrecuenciaMedicion;
    tiempo_manual_horas: number;
    cantidad_personas: number;
}

export interface IniciativaAutomatizacion {
  id_iniciativa: number;
  id_actividades: number[];
  nombre_iniciativa: string;
  objetivo_iniciativa?: string;
  alcance?: string;
  descripcion_problema?: string;
  solucion_propuesta?: string;
  beneficios_esperados?: string;
  prioridad: PrioridadIniciativa;
  estado: EstadoIniciativa;
  responsable_celula?: string;
}

export interface ProyectoAutomatizacion {
    id_proyecto: number;
    titulo: string; // Title
    id_iniciativas: number[];

    // Nuevos campos
    descripcionProblema?: string;
    objetivo?: string;
    situacionInicial?: string;
    situacionDeseada?: string;
    objetivoEspecifico?: string;
    beneficiosEconomicos?: string;
    beneficiosCliente?: string;
    beneficiosColaboradores?: string;
    datosReferencia?: string;
    conclusiones?: string;
    
    fecha_inicio: string; // Fecha Inicio
    fecha_fin: string; // Fecha Finalizacion
    
    tecnologia?: string; // Tecnología
    beneficios_estado?: string;
    estado_proyecto: EstadoProyecto;

    // Campos de variación
    varSeniorityTecnico: number;
    varSeniorityOperativo: number;
    varTiempo: number;
    varInvolucrados: number;
    varFrecuencia: number;
}

export interface ProyectoConNombre extends ProyectoAutomatizacion {
    nombre_iniciativa: string;
}


// Re-export Incident and IncidentUpdate to be used in the service pages
export type { Incident, IncidentUpdate };
