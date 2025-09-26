
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActividadMedicionSchema } from "@/lib/toil/schemas";
import type { ActividadMedicion } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";
import { addActividadMedicion } from "@/lib/toil/data";
import { useRouter } from "next/navigation";


const frecuenciaOptions = ["Diaria", "Semanal", "Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"];

type ActividadMedicionForm = Omit<ActividadMedicion, 'id_medicion'>;

export default function MedirActividadPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const { control, register, handleSubmit, formState: { errors } } = useForm<ActividadMedicionForm>({
        resolver: zodResolver(ActividadMedicionSchema.omit({ id_medicion: true })),
        defaultValues: {
            id_actividad: 0,
            fecha_medicion: new Date().toISOString().split('T')[0],
            frecuencia: 'Mensual',
            tiempo_manual_horas: 0,
            cantidad_personas: 1,
        }
    });

    const onSubmit = async (data: ActividadMedicionForm) => {
        setIsSubmitting(true);
        try {
            await addActividadMedicion(data);
            toast({
                title: "Medición Guardada",
                description: "La medición de la actividad ha sido registrada.",
            });
            router.push('/toil');
        } catch (error) {
            console.error("Error al guardar la medición:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la medición. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Nueva Medición de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="id-actividad">Actividad TOIL a Medir</Label>
                            <Controller
                                name="id_actividad"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value.toString()}>
                                        <SelectTrigger id="id-actividad">
                                            <SelectValue placeholder="Seleccionar una actividad definida" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Actividad 1: Reporte manual de ventas</SelectItem>
                                            <SelectItem value="2">Actividad 2: Conciliación de datos</SelectItem>
                                            <SelectItem value="3">Actividad 3: Creación de usuarios</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.id_actividad && <p className="text-sm text-destructive">{errors.id_actividad.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha-medicion">Fecha de Medición</Label>
                            <Input id="fecha-medicion" type="date" {...register('fecha_medicion')} />
                            {errors.fecha_medicion && <p className="text-sm text-destructive">{errors.fecha_medicion.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="frecuencia">Frecuencia</Label>
                             <Controller
                                name="frecuencia"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="frecuencia">
                                            <SelectValue placeholder="Seleccionar frecuencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frecuenciaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tiempo-manual">Tiempo Manual (horas)</Label>
                            <Input id="tiempo-manual" type="number" placeholder="Ej: 4" {...register('tiempo_manual_horas', { valueAsNumber: true })} />
                            {errors.tiempo_manual_horas && <p className="text-sm text-destructive">{errors.tiempo_manual_horas.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cantidad-personas">Cantidad de Personas</Label>
                            <Input id="cantidad-personas" type="number" placeholder="Ej: 2" {...register('cantidad_personas', { valueAsNumber: true })} />
                            {errors.cantidad_personas && <p className="text-sm text-destructive">{errors.cantidad_personas.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Guardando..." : "Guardar Medición"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </>
  );
}
