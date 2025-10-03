
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProyectoAutomatizacionSchema } from "@/lib/toil/schemas";
import { addProyectoAutomatizacion, updateProyectoAutomatizacion } from "@/lib/toil/data";
import type { ProyectoAutomatizacion, ProyectoConNombre, IniciativaAutomatizacion } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";


const estadoOptions = ["Planificado", "En Ejecución", "Finalizado", "En Pausa", "Cancelado"];

type ProyectoAutomatizacionForm = Omit<ProyectoAutomatizacion, 'id_proyecto'>;

interface CrearProyectoFormProps {
    onSuccess: () => void;
    proyectoToEdit?: ProyectoConNombre | null;
    isEditMode: boolean;
    iniciativas: IniciativaAutomatizacion[];
}

const defaultValues: ProyectoAutomatizacionForm = {
    id_iniciativas: [],
    nombre_iniciativa: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin_estimada: new Date().toISOString().split('T')[0],
    estado_proyecto: "Planificado",
    tecnologia_utilizada: "",
    beneficios_estado: "",
};


export default function CrearProyectoForm({ onSuccess, proyectoToEdit, isEditMode, iniciativas }: CrearProyectoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

     const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ProyectoAutomatizacionForm>({
        resolver: zodResolver(ProyectoAutomatizacionSchema.omit({ id_proyecto: true })),
        defaultValues: proyectoToEdit ? {
            ...proyectoToEdit,
            fecha_inicio: proyectoToEdit.fecha_inicio.split('T')[0],
            fecha_fin_estimada: proyectoToEdit.fecha_fin_estimada.split('T')[0],
        } : defaultValues,
    });
    
    useEffect(() => {
        if (proyectoToEdit && isEditMode) {
            reset({
                ...proyectoToEdit,
                fecha_inicio: new Date(proyectoToEdit.fecha_inicio).toISOString().split('T')[0],
                fecha_fin_estimada: new Date(proyectoToEdit.fecha_fin_estimada).toISOString().split('T')[0],
            });
        } else {
            reset(defaultValues);
        }
    }, [proyectoToEdit, isEditMode, reset]);


    const onSubmit = async (data: ProyectoAutomatizacionForm) => {
        setIsSubmitting(true);
        try {
            if (isEditMode && proyectoToEdit) {
                await updateProyectoAutomatizacion({ ...data, id_proyecto: proyectoToEdit.id_proyecto });
                toast({
                    title: "Proyecto Actualizado",
                    description: "El proyecto de automatización ha sido actualizado.",
                });
            } else {
                await addProyectoAutomatizacion(data);
                toast({
                    title: "Proyecto Guardado",
                    description: "El nuevo proyecto de automatización ha sido creado exitosamente.",
                });
            }
            onSuccess();
        } catch (error) {
             console.error("Error al crear el proyecto:", error);
            toast({
                title: "Error",
                description: "No se pudo crear el proyecto. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const iniciativaOptions: MultiSelectOption[] = useMemo(() => 
        iniciativas
            .filter(inc => inc.estado === 'Aprobada')
            .map(inc => ({
                value: inc.id_iniciativa.toString(),
                label: `${inc.id_iniciativa}: ${inc.nombre_iniciativa}`
            })), [iniciativas]);

  return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="id-iniciativas">Iniciativas a desarrollar</Label>
                    <Controller
                        name="id_iniciativas"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={iniciativaOptions}
                                selected={field.value.map(String)}
                                onChange={(values) => field.onChange(values.map(Number))}
                                placeholder="Seleccionar iniciativas aprobadas..."
                            />
                        )}
                    />
                    {errors.id_iniciativas && <p className="text-sm text-destructive">{errors.id_iniciativas.message}</p>}
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre-iniciativa">Nombre del Proyecto</Label>
                    <Input id="nombre-iniciativa" placeholder="Nombre del proyecto" {...register('nombre_iniciativa')} />
                    {errors.nombre_iniciativa && <p className="text-sm text-destructive">{errors.nombre_iniciativa.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fecha-inicio">Fecha de Inicio</Label>
                    <Input id="fecha-inicio" type="date" {...register('fecha_inicio')} />
                    {errors.fecha_inicio && <p className="text-sm text-destructive">{errors.fecha_inicio.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fecha-fin">Fecha de Fin (Estimada)</Label>
                    <Input id="fecha-fin" type="date" {...register('fecha_fin_estimada')} />
                    {errors.fecha_fin_estimada && <p className="text-sm text-destructive">{errors.fecha_fin_estimada.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="estado-proyecto">Estado del Proyecto</Label>
                        <Controller
                        name="estado_proyecto"
                        control={control}
                        render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="estado-proyecto">
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
                    <Label htmlFor="tecnologia-utilizada">Tecnología Utilizada</Label>
                    <Input id="tecnologia-utilizada" placeholder="Ej: Power Automate, Azure Functions" {...register('tecnologia_utilizada')} />
                        {errors.tecnologia_utilizada && <p className="text-sm text-destructive">{errors.tecnologia_utilizada.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="beneficios-estado">Estado de los Beneficios</Label>
                    <Textarea id="beneficios-estado" placeholder="Describir cómo se medirán y cuál es el estado actual de los beneficios" {...register('beneficios_estado')} />
                        {errors.beneficios_estado && <p className="text-sm text-destructive">{errors.beneficios_estado.message}</p>}
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Guardar Proyecto"}
                </Button>
            </div>
        </form>
  );
}
