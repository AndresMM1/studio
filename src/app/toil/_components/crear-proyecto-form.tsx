
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProyectoAutomatizacionSchema } from "@/lib/toil/schemas";
import { addProyectoAutomatizacion } from "@/lib/toil/data";
import type { ProyectoAutomatizacion } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";


const estadoOptions = ["Planificado", "En Ejecución", "Finalizado", "En Pausa", "Cancelado"];

type ProyectoAutomatizacionForm = Omit<ProyectoAutomatizacion, 'id_proyecto'>;

interface CrearProyectoFormProps {
    onSuccess: () => void;
}

export default function CrearProyectoForm({ onSuccess }: CrearProyectoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

     const { control, register, handleSubmit, formState: { errors } } = useForm<ProyectoAutomatizacionForm>({
        resolver: zodResolver(ProyectoAutomatizacionSchema.omit({ id_proyecto: true })),
        defaultValues: {
            id_iniciativa: 0,
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin_estimada: new Date().toISOString().split('T')[0],
            responsable_celula: "",
            responsable_tecnico: "",
            presupuesto_usd: 0,
            estado_proyecto: "Planificado",
            url_documentacion: "",
            tecnologia_utilizada: "",
            beneficios_estado: "",
        },
    });


    const onSubmit = async (data: ProyectoAutomatizacionForm) => {
        setIsSubmitting(true);
        try {
            await addProyectoAutomatizacion(data);
            toast({
                title: "Proyecto Guardado",
                description: "El nuevo proyecto de automatización ha sido creado exitosamente.",
            });
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

  return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="id-iniciativa">Iniciativa a desarrollar</Label>
                    <Controller
                        name="id_iniciativa"
                        control={control}
                        render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value.toString()}>
                                <SelectTrigger id="id-iniciativa">
                                    <SelectValue placeholder="Seleccionar una iniciativa aprobada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Iniciativa 1: Automatización de Reporte de Ventas</SelectItem>
                                    <SelectItem value="2">Iniciativa 2: Proceso de Alta de Nuevos Clientes</SelectItem>
                                    <SelectItem value="3">Iniciativa 3: Sincronización de Inventario</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.id_iniciativa && <p className="text-sm text-destructive">{errors.id_iniciativa.message}</p>}
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
                    <Label htmlFor="responsable-celula">Responsable Célula</Label>
                    <Input id="responsable-celula" placeholder="Nombre del equipo o líder" {...register('responsable_celula')} />
                    {errors.responsable_celula && <p className="text-sm text-destructive">{errors.responsable_celula.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="responsable-tecnico">Responsable Técnico</Label>
                    <Input id="responsable-tecnico" placeholder="Nombre del desarrollador o técnico" {...register('responsable_tecnico')} />
                        {errors.responsable_tecnico && <p className="text-sm text-destructive">{errors.responsable_tecnico.message}</p>}
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="presupuesto">Presupuesto (USD)</Label>
                    <Input id="presupuesto" type="number" placeholder="Ej: 5000" {...register('presupuesto_usd', { valueAsNumber: true })} />
                    {errors.presupuesto_usd && <p className="text-sm text-destructive">{errors.presupuesto_usd.message}</p>}
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="estado-proyecto">Estado del Proyecto</Label>
                        <Controller
                        name="estado_proyecto"
                        control={control}
                        render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="url-documentacion">URL de Documentación</Label>
                    <Input id="url-documentacion" placeholder="Enlace a Confluence, SharePoint, etc." {...register('url_documentacion')} />
                    {errors.url_documentacion && <p className="text-sm text-destructive">{errors.url_documentacion.message}</p>}
                </div>
                    <div className="space-y-2 md:col-span-2">
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
                    {isSubmitting ? "Guardando..." : "Guardar Proyecto"}
                </Button>
            </div>
        </form>
  );
}
