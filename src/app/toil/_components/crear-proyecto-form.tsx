
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";


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
    titulo: "",
    descripcionProblema: "",
    objetivo: "",
    situacionInicial: "",
    situacionDeseada: "",
    objetivoEspecifico: "",
    beneficiosEconomicos: "",
    beneficiosCliente: "",
    beneficiosColaboradores: "",
    datosReferencia: "",
    conclusiones: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    estado_proyecto: "Planificado",
    tecnologia: "",
    beneficios_estado: "",
    varSeniorityTecnico: 1,
    varSeniorityOperativo: 1,
    varTiempo: 0,
    varInvolucrados: 0,
    varFrecuencia: 0,
};


export default function CrearProyectoForm({ onSuccess, proyectoToEdit, isEditMode, iniciativas }: CrearProyectoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

     const form = useForm<ProyectoAutomatizacionForm>({
        resolver: zodResolver(ProyectoAutomatizacionSchema.omit({ id_proyecto: true })),
        defaultValues: proyectoToEdit ? {
            ...proyectoToEdit,
            id_iniciativas: proyectoToEdit.id_iniciativas || [],
            fecha_inicio: proyectoToEdit.fecha_inicio.split('T')[0],
            fecha_fin: proyectoToEdit.fecha_fin.split('T')[0],
        } : defaultValues,
    });
    
    useEffect(() => {
        if (proyectoToEdit && isEditMode) {
            form.reset({
                ...proyectoToEdit,
                id_iniciativas: proyectoToEdit.id_iniciativas || [],
                fecha_inicio: new Date(proyectoToEdit.fecha_inicio).toISOString().split('T')[0],
                fecha_fin: new Date(proyectoToEdit.fecha_fin).toISOString().split('T')[0],
            });
        } else {
            form.reset(defaultValues);
        }
    }, [proyectoToEdit, isEditMode, form.reset]);


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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto p-4 border rounded-md">
                    
                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="titulo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Título del proyecto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="id_iniciativas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Iniciativas Vinculadas</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={iniciativaOptions}
                                            selected={field.value.map(String)}
                                            onChange={(values) => field.onChange(values.map(Number))}
                                            placeholder="Seleccionar iniciativas aprobadas..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <Separator className="lg:col-span-4" />

                    <div className="lg:col-span-4">
                        <FormField
                            control={form.control}
                            name="descripcionProblema"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción del Problema</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe el problema" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                     <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="objetivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo General</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Objetivo general del proyecto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                     <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="objetivoEspecifico"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo Específico</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Objetivos específicos y medibles" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="situacionInicial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Situación Inicial</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Cómo se hace actualmente" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="situacionDeseada"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Situación Deseada</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Cómo se hará tras la automatización" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="lg:col-span-4" />

                     <h3 className="lg:col-span-4 font-medium text-lg">Beneficios</h3>

                     <FormField
                        control={form.control}
                        name="beneficiosEconomicos"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Beneficios Económicos</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ahorro de costos, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="beneficiosCliente"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Beneficios para el Cliente</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Mejora de tiempos, calidad, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="beneficiosColaboradores"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Beneficios para Colaboradores</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Reducción de carga, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="beneficios_estado"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Estado de los Beneficios</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Cómo se medirán y estado actual" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Separator className="lg:col-span-4" />

                    <h3 className="lg:col-span-4 font-medium text-lg">Detalles Técnicos y de Gestión</h3>
                    
                     <FormField
                        control={form.control}
                        name="fecha_inicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Inicio</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fecha_fin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Fin</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="estado_proyecto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado del Proyecto</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {estadoOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tecnologia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tecnología Utilizada</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Power Automate, Azure Functions" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="datosReferencia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Datos de Referencia</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Datos usados para el análisis" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="lg:col-span-2">
                        <FormField
                            control={form.control}
                            name="conclusiones"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conclusiones</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Conclusiones del proyecto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="lg:col-span-4" />
                    <h3 className="lg:col-span-4 font-medium text-lg">Resultados Esperados (Variación)</h3>

                     <FormField
                        control={form.control}
                        name="varSeniorityTecnico"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Var Seniority Técnico</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
                                </FormControl>
                                <FormDescription>Resultado esperado para el seniority técnico.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="varSeniorityOperativo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Var Seniority Operativo</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
                                </FormControl>
                                <FormDescription>Resultado esperado del seniority operativo.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="varTiempo"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Var Tiempo (%)</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            defaultValue={[field.value]}
                                            max={100}
                                            step={1}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="w-[85%]"
                                        />
                                        <span className="w-[15%] text-right font-mono text-sm">{field.value}%</span>
                                    </div>
                                </FormControl>
                                <FormDescription>Variación porcentual del tiempo.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="varInvolucrados"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Var Involucrados (%)</FormLabel>
                                 <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            defaultValue={[field.value]}
                                            max={100}
                                            step={1}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="w-[85%]"
                                        />
                                        <span className="w-[15%] text-right font-mono text-sm">{field.value}%</span>
                                    </div>
                                </FormControl>
                                <FormDescription>Variación porcentual de involucrados.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="varFrecuencia"
                        render={({ field }) => (
                            <FormItem className="lg:col-span-2">
                                <FormLabel>Var Frecuencia (%)</FormLabel>
                                <FormControl>
                                     <div className="flex items-center gap-4">
                                        <Slider
                                            defaultValue={[field.value]}
                                            max={100}
                                            step={1}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            className="w-[85%]"
                                        />
                                        <span className="w-[15%] text-right font-mono text-sm">{field.value}%</span>
                                    </div>
                                </FormControl>
                                <FormDescription>Variación porcentual de la frecuencia.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Guardar Proyecto"}
                    </Button>
                </div>
            </form>
        </Form>
  );
}
