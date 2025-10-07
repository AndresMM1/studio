
import { z } from 'zod';
import type { 
    Complejidad,
    PrioridadIniciativa,
    EstadoIniciativa,
    EstadoProyecto
} from './types';

const complejidadEnum: [Complejidad, ...Complejidad[]] = ["Baja", "Media", "Alta"];
const prioridadIniciativaEnum: [PrioridadIniciativa, ...PrioridadIniciativa[]] = ["Baja", "Media", "Alta", "Crítica"];
const estadoIniciativaEnum: [EstadoIniciativa, ...EstadoIniciativa[]] = ["Propuesta", "Aprobada", "Rechazada", "En progreso"];
const estadoProyectoEnum: [EstadoProyecto, ...EstadoProyecto[]] = ["Planificado", "En Ejecución", "Finalizado", "En Pausa", "Cancelado"];
const tipoMedicionEnum = ["Real", "Proyectada"] as const;


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
    "Tipo Medicion": z.enum(tipoMedicionEnum),
    "Fecha Medicion": z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
    "Señority Tecnico": z.number().nonnegative("El valor no puede ser negativo."),
    "Señority Operativo": z.number().nonnegative("El valor no puede ser negativo."),
    "Tiempo Minutos": z.number().nonnegative("El tiempo no puede ser negativo."),
    "Involucrados": z.number().int().positive("Debe haber al menos una persona involucrada."),
    "Cantidad x Mes": z.number().int().positive("La cantidad debe ser al menos 1."),
    "Tiempo x Mes": z.number().nonnegative(),
    "Tiempo Hrs x Mes": z.number().nonnegative(),
    "Otra Unidad Medida": z.string().optional(),
    "Unidad Tiempo": z.string().min(1),
    "Medida": z.string().optional(),
});


export const IniciativaAutomatizacionSchema = z.object({
  id_iniciativa: z.number().int().positive(),
  id_proyecto: z.number().int().positive().optional(),
  id_actividades: z.array(z.number()).min(1, "Debe seleccionar al menos una actividad."),
  nombre_iniciativa: z.string().min(1, "El nombre de la iniciativa es requerido."),
  objetivo_iniciativa: z.string().min(1, "El objetivo es requerido.").optional(),
  alcance: z.string().min(1, "El alcance es requerido.").optional(),
  descripcion_problema: z.string().min(1, "La descripción del problema es requerida.").optional(),
  solucion_propuesta: z.string().min(1, "La solución propuesta es requerida.").optional(),
  beneficios_esperados: z.string().min(1, "Los beneficios esperados son requeridos.").optional(),
  prioridad: z.enum(prioridadIniciativaEnum),
  estado: z.enum(estadoIniciativaEnum),
  responsable_celula: z.string().min(1, "El responsable es requerido.").optional(),
});

export const ProyectoAutomatizacionSchema = z.object({
    id_proyecto: z.number().int().positive(),
    titulo: z.string().min(1, "El título es requerido."),
    
    descripcionProblema: z.string().optional().or(z.literal('')),
    objetivo: z.string().optional().or(z.literal('')),
    situacionInicial: z.string().optional().or(z.literal('')),
    situacionDeseada: z.string().optional().or(z.literal('')),
    objetivoEspecifico: z.string().optional().or(z.literal('')),
    beneficiosEconomicos: z.string().optional().or(z.literal('')),
    beneficiosCliente: z.string().optional().or(z.literal('')),
    beneficiosColaboradores: z.string().optional().or(z.literal('')),
    datosReferencia: z.string().optional().or(z.literal('')),
    conclusiones: z.string().optional().or(z.literal('')),

    fecha_inicio: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de inicio inválida" }),
    fecha_fin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha de fin inválida" }),
    estado_proyecto: z.enum(estadoProyectoEnum),
    tecnologia: z.string().optional().or(z.literal('')),
    beneficios_estado: z.string().optional().or(z.literal('')),

    varSeniorityTecnico: z.number({ required_error: 'Este campo es requerido.' }),
    varSeniorityOperativo: z.number({ required_error: 'Este campo es requerido.' }),
    varTiempo: z.number().min(0, "El valor debe ser al menos 0.").max(100, "El valor no puede ser mayor a 100."),
    varInvolucrados: z.number().min(0, "El valor debe ser al menos 0.").max(100, "El valor no puede ser mayor a 100."),
    varFrecuencia: z.number().min(0, "El valor debe ser al menos 0.").max(100, "El valor no puede ser mayor a 100."),
});

    
