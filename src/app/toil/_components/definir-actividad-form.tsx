
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActividadDefinicionSchema } from "@/lib/toil/schemas";
import { type ActividadDefinicion, type GrupoCelula } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";
import { addActividadDefinicion } from "@/lib/toil/data";

const complejidadOptions: ActividadDefinicion['complejidad_ejecucion'][] = ["Baja", "Media", "Alta"];

type ActividadDefinicionForm = Omit<ActividadDefinicion, 'id_actividad'>;

interface DefinirActividadFormProps {
  gruposCelula: GrupoCelula[];
  onSuccess: () => void;
}

export default function DefinirActividadForm({ onSuccess, gruposCelula }: DefinirActividadFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, control, formState: { errors } } = useForm<ActividadDefinicionForm>({
        resolver: zodResolver(ActividadDefinicionSchema.omit({ id_actividad: true })),
        defaultValues: {
            id_grupo_celula: 0,
            actividad_practica: "",
            actividad_detalle: "",
            origen_operacion: "",
            origen_alcance: "",
            impacto_negocio_desc: "",
            impacto_operacion_desc: "",
            impacto_negocio: 1,
            impacto_operacion: 1,
            complejidad_ejecucion: "Baja",
            automatizable: false,
            es_toil: true,
        },
    });

    const onSubmit = async (data: ActividadDefinicionForm) => {
        setIsSubmitting(true);
        try {
            await addActividadDefinicion(data);
            toast({
                title: "Actividad Guardada",
                description: "La nueva actividad de TOIL ha sido registrada exitosamente.",
            });
            onSuccess();
        } catch (error) {
            console.error("Error al guardar la actividad:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la actividad. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="id-grupo-celula">Grupo Célula/Chapter</Label>
                    <Controller
                        name="id_grupo_celula"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <SelectTrigger id="id-grupo-celula">
                                    <SelectValue placeholder="Seleccionar un grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gruposCelula.map(grupo => {
                                        const Icon = grupo.icon;
                                        return (
                                            <SelectItem key={grupo.ID} value={grupo.ID.toString()}>
                                                <div className="flex items-center gap-2">
                                                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                                    <span>{grupo.Title}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.id_grupo_celula && <p className="text-sm text-destructive">{errors.id_grupo_celula.message}</p>}
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="actividad-practica">Actividad Práctica</Label>
                        <Controller
                        name="actividad_practica"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="actividad-practica">
                                    <SelectValue placeholder="Seleccionar una práctica" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gestion-incidentes">Gestión de Incidentes</SelectItem>
                                    <SelectItem value="desarrollo-software">Desarrollo de Software</SelectItem>
                                    <SelectItem value="analisis-datos">Análisis de Datos</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        />
                        {errors.actividad_practica && <p className="text-sm text-destructive">{errors.actividad_practica.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="actividad-detalle">Actividad Detalle</Label>
                    <Textarea id="actividad-detalle" placeholder="Describe la actividad en detalle..." {...register("actividad_detalle")} />
                    {errors.actividad_detalle && <p className="text-sm text-destructive">{errors.actividad_detalle.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="origen-operacion">Origen de la Operación</Label>
                    <Input id="origen-operacion" placeholder="Ej: Reporte manual de ventas" {...register("origen_operacion")} />
                    {errors.origen_operacion && <p className="text-sm text-destructive">{errors.origen_operacion.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="origen-alcance">Origen del Alcance</Label>
                    <Input id="origen-alcance" placeholder="Ej: Solicitud de gerencia" {...register("origen_alcance")} />
                    {errors.origen_alcance && <p className="text-sm text-destructive">{errors.origen_alcance.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="impacto-negocio-desc">Descripción Impacto de Negocio</Label>
                    <Textarea id="impacto-negocio-desc" placeholder="Describe cómo impacta al negocio..." {...register("impacto_negocio_desc")} />
                    {errors.impacto_negocio_desc && <p className="text-sm text-destructive">{errors.impacto_negocio_desc.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="impacto-operacion-desc">Descripción Impacto de Operación</Label>
                    <Textarea id="impacto-operacion-desc" placeholder="Describe cómo impacta a la operación..." {...register("impacto_operacion_desc")} />
                    {errors.impacto_operacion_desc && <p className="text-sm text-destructive">{errors.impacto_operacion_desc.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="impacto-negocio">Impacto de Negocio (1-10)</Label>
                    <Input
                        id="impacto-negocio"
                        type="number"
                        min="1"
                        max="10"
                        {...register("impacto_negocio", { valueAsNumber: true })}
                    />
                    {errors.impacto_negocio && <p className="text-sm text-destructive">{errors.impacto_negocio.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="impacto-operacion">Impacto de Operación (1-10)</Label>
                    <Input
                        id="impacto-operacion"
                        type="number"
                        min="1"
                        max="10"
                        {...register("impacto_operacion", { valueAsNumber: true })}
                    />
                    {errors.impacto_operacion && <p className="text-sm text-destructive">{errors.impacto_operacion.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="complejidad-ejecucion">Complejidad de Ejecución</Label>
                        <Controller
                        name="complejidad_ejecucion"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="complejidad-ejecucion">
                                    <SelectValue placeholder="Seleccionar complejidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {complejidadOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                        />
                </div>
                    <div className="flex items-center space-x-4 pt-6">
                    <div className="flex items-center space-x-2">
                            <Controller
                            name="automatizable"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="automatizable"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="automatizable">Automatizable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="es_toil"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="toil"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="toil">Es TOIL</Label>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Guardando..." : "Guardar Actividad"}
                </Button>
            </div>
      </form>
  );
}
