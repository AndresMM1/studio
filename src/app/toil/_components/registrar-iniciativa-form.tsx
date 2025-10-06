"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IniciativaAutomatizacionSchema } from "@/lib/toil/schemas";
import type { ActividadDefinicion, IniciativaAutomatizacion, ProyectoConNombre } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";
import { addIniciativaAutomatizacion, updateIniciativaAutomatizacion } from "@/lib/toil/data";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";

const prioridadOptions = ["Baja", "Media", "Alta", "Crítica"];
const estadoOptions = ["Propuesta", "Aprobada", "Rechazada", "En progreso"];

type IniciativaAutomatizacionForm = Omit<IniciativaAutomatizacion, 'id_iniciativa'>;

const defaultValues: IniciativaAutomatizacionForm = {
    id_actividades: [],
    nombre_iniciativa: "",
    objetivo_iniciativa: "",
    alcance: "",
    descripcion_problema: "",
    solucion_propuesta: "",
    beneficios_esperados: "",
    prioridad: "Media",
    estado: "Propuesta",
    responsable_celula: "",
    id_proyecto: undefined,
};

interface RegistrarIniciativaFormProps {
    onSuccess: () => void;
    actividades: ActividadDefinicion[];
    proyectos: ProyectoConNombre[];
    iniciativaToEdit?: IniciativaAutomatizacion | null;
    isEditMode: boolean;
}

export default function RegistrarIniciativaForm({ onSuccess, actividades, proyectos, iniciativaToEdit, isEditMode }: RegistrarIniciativaFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<IniciativaAutomatizacionForm>({
        resolver: zodResolver(IniciativaAutomatizacionSchema.omit({ id_iniciativa: true })),
        defaultValues: iniciativaToEdit || defaultValues,
    });
    
     useEffect(() => {
        if (iniciativaToEdit && isEditMode) {
            reset(iniciativaToEdit);
        } else {
            reset(defaultValues);
        }
    }, [iniciativaToEdit, isEditMode, reset]);


    const onSubmit = async (data: IniciativaAutomatizacionForm) => {
        setIsSubmitting(true);
        try {
            if (isEditMode && iniciativaToEdit) {
                await updateIniciativaAutomatizacion({ ...data, id_iniciativa: iniciativaToEdit.id_iniciativa });
                 toast({
                    title: "Iniciativa Actualizada",
                    description: "La iniciativa de automatización ha sido actualizada.",
                });
            } else {
                await addIniciativaAutomatizacion(data);
                toast({
                    title: "Iniciativa Guardada",
                    description: "La iniciativa de automatización ha sido registrada exitosamente.",
                });
            }
            onSuccess();
        } catch (error) {
            console.error("Error al registrar la iniciativa:", error);
            toast({
                title: "Error",
                description: "No se pudo registrar la iniciativa. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const actividadOptions: MultiSelectOption[] = useMemo(() => 
        actividades.map(act => ({
            value: act.id_actividad.toString(),
            label: `${act.id_actividad}: ${act.actividad_detalle}`
        })), [actividades]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-4">
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="id-proyecto">Proyecto de Automatización (Opcional)</Label>
                <Controller
                    name="id_proyecto"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar un proyecto" />
                            </SelectTrigger>
                            <SelectContent>
                                {proyectos.map(p => (
                                    <SelectItem key={p.id_proyecto} value={p.id_proyecto.toString()}>
                                        {p.titulo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="id-actividad">Actividades TOIL a Automatizar</Label>
                <Controller
                    name="id_actividades"
                    control={control}
                    render={({ field }) => (
                            <MultiSelect
                            options={actividadOptions}
                            selected={field.value.map(String)}
                            onChange={(values) => field.onChange(values.map(Number))}
                            placeholder="Seleccionar actividades..."
                            />
                    )}
                />
                    {errors.id_actividades && <p className="text-sm text-destructive">{errors.id_actividades.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="iniciativa-nombre">Nombre de la Iniciativa</Label>
                <Input id="iniciativa-nombre" placeholder="Ej: Automatización de Reporte de Ventas Semanal" {...register('nombre_iniciativa')}/>
                {errors.nombre_iniciativa && <p className="text-sm text-destructive">{errors.nombre_iniciativa.message}</p>}
            </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="iniciativa-objetivo">Objetivo de la Iniciativa</Label>
                <Textarea id="iniciativa-objetivo" placeholder="Describe el objetivo principal de esta iniciativa" {...register('objetivo_iniciativa')}/>
                    {errors.objetivo_iniciativa && <p className="text-sm text-destructive">{errors.objetivo_iniciativa.message}</p>}
            </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="iniciativa-alcance">Alcance</Label>
                <Textarea id="iniciativa-alcance" placeholder="Detalla qué incluye y qué no incluye esta iniciativa" {...register('alcance')}/>
                {errors.alcance && <p className="text-sm text-destructive">{errors.alcance.message}</p>}
            </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion-problema">Descripción del Problema</Label>
                <Textarea id="descripcion-problema" placeholder="Explica el problema que esta iniciativa busca resolver" {...register('descripcion_problema')} />
                {errors.descripcion_problema && <p className="text-sm text-destructive">{errors.descripcion_problema.message}</p>}
            </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="solucion-propuesta">Solución Propuesta</Label>
                <Textarea id="solucion-propuesta" placeholder="Describe la solución técnica o de proceso que se propone" {...register('solucion_propuesta')} />
                {errors.solucion_propuesta && <p className="text-sm text-destructive">{errors.solucion_propuesta.message}</p>}
            </div>
                <div className="space-y-2 md:col-span-2">
                <Label htmlFor="beneficios-esperados">Beneficios Esperados</Label>
                <Textarea id="beneficios-esperados" placeholder="Lista los beneficios cuantitativos y cualitativos" {...register('beneficios_esperados')} />
                {errors.beneficios_esperados && <p className="text-sm text-destructive">{errors.beneficios_esperados.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                    <Controller
                    name="prioridad"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="prioridad">
                                <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                                {prioridadOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    />
            </div>
                <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="estado">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {estadoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    />
            </div>
                <div className="space-y-2">
                <Label htmlFor="responsable-celula">Responsable Célula</Label>
                <Input id="responsable-celula" placeholder="Nombre del responsable o equipo" {...register('responsable_celula')} />
                {errors.responsable_celula && <p className="text-sm text-destructive">{errors.responsable_celula.message}</p>}
            </div>
        </div>
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Guardar Iniciativa"}
            </Button>
        </div>
    </form>
  );
}
