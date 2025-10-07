

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


type ActividadMedicionForm = Omit<ActividadMedicion, 'id_medicion' | 'Tiempo x Mes' | 'Tiempo Hrs x Mes' | 'Otra Unidad Medida' | 'Medida'>;

export default function MedirActividadPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [actividades, setActividades] = useState<ActividadDefinicion[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function loadActividades() {
            setIsLoading(true);
            try {
                const data = await getActividadesDefinicion();
                setActividades(data);
            } catch (error) {
                console.error("Error al cargar actividades", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las actividades.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadActividades();
    }, [toast]);

    const form = useForm<ActividadMedicionForm>({
        resolver: zodResolver(ActividadMedicionSchema.omit({ id_medicion: true, "Tiempo x Mes": true, "Tiempo Hrs x Mes": true, "Otra Unidad Medida": true, "Medida": true })),
        defaultValues: {
            id_actividad: undefined,
            "Fecha Medicion": new Date().toISOString().split('T')[0],
            "Tipo Medicion": "Real",
            "Señority Tecnico": 0,
            "Señority Operativo": 0,
            "Tiempo Minutos": 0,
            "Involucrados": 1,
            "Cantidad x Mes": 1,
            "Unidad Tiempo": "Minutos",
        }
    });

    const onSubmit = async (data: ActividadMedicionForm) => {
        setIsSubmitting(true);
        try {
            // Calcular campos derivados
            const tiempoPorMes = data["Tiempo Minutos"] * data["Cantidad x Mes"];
            const horasPorMes = tiempoPorMes / 60;
            
            const fullData: Omit<ActividadMedicion, 'id_medicion'> = {
                ...data,
                "Tiempo x Mes": tiempoPorMes,
                "Tiempo Hrs x Mes": horasPorMes,
                "Otra Unidad Medida": "", // Opcional, puedes añadirlo al form
                "Medida": "" // Opcional, puedes añadirlo al form
            }

            await addActividadMedicion(fullData);
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="max-w-4xl mx-auto my-8">
                <CardHeader>
                    <CardTitle>Nueva Medición de Actividad</CardTitle>
                    <CardDescription>Registra los datos de medición para una actividad TOIL específica.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-50" />
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="id-actividad">Actividad TOIL a Medir</Label>
                            <Controller
                                name="id_actividad"
                                control={form.control}
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
                            {form.formState.errors.id_actividad && <p className="text-sm text-destructive">{form.formState.errors.id_actividad.message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="fecha-medicion">Fecha de Medición</Label>
                            <Input id="fecha-medicion" type="date" {...form.register('Fecha Medicion')} />
                            {form.formState.errors['Fecha Medicion'] && <p className="text-sm text-destructive">{form.formState.errors['Fecha Medicion'].message}</p>}
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="tipo-medicion">Tipo de Medición</Label>
                             <Controller
                                name="Tipo Medicion"
                                control={form.control}
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
                            <Label htmlFor="tiempo-minutos">Tiempo por Ejecución (Minutos)</Label>
                            <Input id="tiempo-minutos" type="number" placeholder="Ej: 60" {...form.register('Tiempo Minutos', { valueAsNumber: true })} />
                            {form.formState.errors['Tiempo Minutos'] && <p className="text-sm text-destructive">{form.formState.errors['Tiempo Minutos'].message}</p>}
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="seniority-tecnico">Seniority Técnico</Label>
                            <Input id="seniority-tecnico" type="number" placeholder="Ej: 3" {...form.register('Señority Tecnico', { valueAsNumber: true })} />
                            {form.formState.errors['Señority Tecnico'] && <p className="text-sm text-destructive">{form.formState.errors['Señority Tecnico'].message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="seniority-operativo">Seniority Operativo</Label>
                            <Input id="seniority-operativo" type="number" placeholder="Ej: 1" {...form.register('Señority Operativo', { valueAsNumber: true })} />
                             {form.formState.errors['Señority Operativo'] && <p className="text-sm text-destructive">{form.formState.errors['Señority Operativo'].message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="personas-involucradas">Personas Involucradas</Label>
                            <Input id="personas-involucradas" type="number" placeholder="Ej: 2" {...form.register('Involucrados', { valueAsNumber: true })} />
                            {form.formState.errors['Involucrados'] && <p className="text-sm text-destructive">{form.formState.errors['Involucrados'].message}</p>}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="cantidad-mes">Cantidad por Mes</Label>
                            <Input id="cantidad-mes" type="number" placeholder="Ej: 30" {...form.register('Cantidad x Mes', { valueAsNumber: true })} />
                             {form.formState.errors['Cantidad x Mes'] && <p className="text-sm text-destructive">{form.formState.errors['Cantidad x Mes'].message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unidad-tiempo">Unidad de Tiempo</Label>
                             <Controller
                                name="Unidad Tiempo"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="unidad-tiempo">
                                            <SelectValue placeholder="Seleccionar unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Minutos">Minutos</SelectItem>
                                            <SelectItem value="Horas">Horas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end">
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Guardando..." : "Guardar Medición"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </>
  );
}
