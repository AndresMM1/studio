
import { z } from 'zod';
import type { 
    Complejidad,
    FrecuenciaMedicion,
    PrioridadIniciativa,
    EstadoIniciativa,
    EstadoProyecto
} from './types';

const complejidadEnum: [Complejidad, ...Complejidad[]] = ["Baja", "Media", "Alta"];
const frecuenciaEnum: [FrecuenciaMedicion, ...FrecuenciaMedicion[]] = ["Diaria", "Semanal", "Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"];
const prioridadIniciativaEnum: [PrioridadIniciativa, ...PrioridadIniciativa[]] = ["Baja", "Media", "Alta", "Crítica"];
const estadoIniciativaEnum: [EstadoIniciativa, ...EstadoIniciativa[]] = ["Propuesta", "Aprobada", "Rechazada", "En progreso"];
const estadoProyectoEnum: [EstadoProyecto, ...EstadoProyecto[]] = ["Planificado", "En Ejecución", "Finalizado", "En Pausa", "Cancelado"];


export const ActividadDefinicionSchema = z.object({
  id_actividad: z.number().int().positive(),
  id_grupo_celula: z.number().int().positive({ message: "El grupo célula es requerido." }),
  actividad_practica: z.string().min(1, "La actividad práctica es requerida."),
  actividad_detalle: z.string().min(1, "El detalle de la actividad es requerido."),
  origen_operacion: z.string().min(1, "El origen de la operación es requerido."),
  origen_alcance: z.string().min(1, "El origen del alcance es requerido."),
  impacto_negocio_desc: z.string().min(1, "La descripción del impacto de negocio es requerida."),
  impacto_operacion_desc: z.string().min(1, "La descripción del impacto de operación es requerida."),
  impacto_negocio: z.number().min(1, "El impacto debe ser al menos 1.").max(10, "El impacto no puede ser mayor a 10."),
  impacto_operacion: z.number().min(1, "El impacto debe ser al menos 1.").max(10, "El impacto no puede ser mayor a 10."),
  complejidad_ejecucion: z.enum(complejidadEnum),
  automatizable: z.boolean(),
  es_toil: z.boolean(),
});

export const ActividadMedicionSchema = z.object({
    id_medicion: z.number().int().positive(),
    id_actividad: z.number().int().positive("La actividad es requerida."),
    fecha_medicion: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
    frecuencia: z.enum(frecuenciaEnum),
    tiempo_manual_horas: z.number().positive("El tiempo debe ser un número positivo."),
    cantidad_personas: z.number().int().positive("La cantidad de personas debe ser un número entero positivo."),
});

export const IniciativaAutomatizacionSchema = z.object({
  id_iniciativa: z.number().int().positive(),
  id_actividades: z.array(z.number()).min(1, "Debe seleccionar al menos una actividad."),
  nombre_iniciativa: z.string().min(1, "El nombre de la iniciativa es requerido."),
  objetivo_iniciativa: z.string().min(1, "El objetivo es requerido."),
  alcance: z.string().min(1, "El alcance es requerido."),
  descripcion_problema: z.string().min(1, "La descripción del problema es requerida."),
  solucion_propuesta: z.string().min(1, "La solución propuesta es requerida."),
  beneficios_esperados: z.string().min(1, "Los beneficios esperados son requeridos."),
  prioridad: z.enum(prioridadIniciativaEnum),
  estado: z.enum(estadoIniciativaEnum),
  responsable_celula: z.string().min(1, "El responsable es requerido."),
});

export const ProyectoAutomatizacionSchema = z.object({
    id_proyecto: z.number().int().positive(),
    id_iniciativa: z.number().int().positive("La iniciativa es requerida."),
    fecha_inicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de inicio inválida" }),
    fecha_fin_estimada: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de fin inválida" }),
    responsable_celula: z.string().min(1, "El responsable de la célula es requerido."),
    responsable_tecnico: z.string().min(1, "El responsable técnico es requerido."),
    presupuesto_usd: z.number().nonnegative("El presupuesto no puede ser negativo."),
    estado_proyecto: z.enum(estadoProyectoEnum),
    url_documentacion: z.string().url("La URL de documentación debe ser una URL válida.").optional().or(z.literal('')),
    tecnologia_utilizada: z.string().min(1, "La tecnología utilizada es requerida."),
    beneficios_estado: z.string().min(1, "El estado de los beneficios es requerido."),
});
