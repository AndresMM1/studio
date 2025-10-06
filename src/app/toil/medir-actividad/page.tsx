
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActividadMedicionSchema } from "@/lib/toil/schemas";
import type { ActividadMedicion, ActividadDefinicion } from "@/lib/toil/types";
import { useToast } from "@/hooks/use-toast";
import { addActividadMedicion, getActividadesDefinicion } from "@/lib/toil/data";
import { useRouter } from "next/navigation";


const tipoMedicionOptions = ["Real", "Proyectada"];
const frecuenciaTipoOptions = ["Diaria", "Semanal", "Mensual", "Bimestral", "Trimestral", "Semestral", "Anual"];
const ioOptions = ["Input", "Output"];


type ActividadMedicionForm = Omit<ActividadMedicion, 'id_medicion'>;

export default function MedirActividadPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actividades, setActividades] = useState<ActividadDefinicion[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function loadActividades() {
            const data = await getActividadesDefinicion();
            setActividades(data);
        }
        loadActividades();
    }, []);

    const { control, register, handleSubmit, formState: { errors } } = useForm<ActividadMedicionForm>({
        resolver: zodResolver(ActividadMedicionSchema.omit({ id_medicion: true })),
        defaultValues: {
            id_actividad: undefined,
            fecha_medicion: new Date().toISOString().split('T')[0],
            "Tipo Medicion": "Real",
            "Señority Tecnico": "",
            "Señority Operativo": "",
            "Tiempo Minutos": 0,
            "Personas Involucradas": 1,
            "Frecuencia": 1,
            "Frecuencia Tipo": "Mensual",
            "I/O": "Input",
            "Url Evidencia": ""
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
                    <CardDescription>Registra los datos de medición para una actividad TOIL específica.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="id-actividad">Actividad TOIL a Medir</Label>
                            <Controller
                                name="id_actividad"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                                        <SelectTrigger id="id-actividad">
                                            <SelectValue placeholder="Seleccionar una actividad definida" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actividades.map(act => (
                                                <SelectItem key={act.id_actividad} value={act.id_actividad.toString()}>
                                                    {act.id_actividad}: {act.actividad_detalle}
                                                </SelectItem>
                                            ))}
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
                            <Label htmlFor="tipo-medicion">Tipo de Medición</Label>
                             <Controller
                                name="Tipo Medicion"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="tipo-medicion">
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tipoMedicionOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tiempo-minutos">Tiempo Invertido (Minutos)</Label>
                            <Input id="tiempo-minutos" type="number" placeholder="Ej: 60" {...register('Tiempo Minutos', { valueAsNumber: true })} />
                            {errors['Tiempo Minutos'] && <p className="text-sm text-destructive">{errors['Tiempo Minutos'].message}</p>}
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="seniority-tecnico">Seniority Técnico</Label>
                            <Input id="seniority-tecnico" placeholder="Ej: Semi-Senior" {...register('Señority Tecnico')} />
                            {errors['Señority Tecnico'] && <p className="text-sm text-destructive">{errors['Señority Tecnico'].message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="seniority-operativo">Seniority Operativo</Label>
                            <Input id="seniority-operativo" placeholder="Ej: Junior" {...register('Señority Operativo')} />
                             {errors['Señority Operativo'] && <p className="text-sm text-destructive">{errors['Señority Operativo'].message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="personas-involucradas">Personas Involucradas</Label>
                            <Input id="personas-involucradas" type="number" placeholder="Ej: 2" {...register('Personas Involucradas', { valueAsNumber: true })} />
                            {errors['Personas Involucradas'] && <p className="text-sm text-destructive">{errors['Personas Involucradas'].message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="frecuencia">Frecuencia (Cantidad)</Label>
                            <Input id="frecuencia" type="number" placeholder="Ej: 5" {...register('Frecuencia', { valueAsNumber: true })} />
                             {errors.Frecuencia && <p className="text-sm text-destructive">{errors.Frecuencia.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="frecuencia-tipo">Frecuencia (Tipo)</Label>
                             <Controller
                                name="Frecuencia Tipo"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="frecuencia-tipo">
                                            <SelectValue placeholder="Seleccionar tipo de frecuencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frecuenciaTipoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="io">Input/Output</Label>
                             <Controller
                                name="I/O"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="io">
                                            <SelectValue placeholder="Seleccionar I/O" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ioOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        
                         <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="url-evidencia">URL Evidencia</Label>
                            <Input id="url-evidencia" type="url" placeholder="https://..." {...register('Url Evidencia')} />
                            {errors['Url Evidencia'] && <p className="text-sm text-destructive">{errors['Url Evidencia'].message}</p>}
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
