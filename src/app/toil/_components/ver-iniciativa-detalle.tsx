"use client";

import type { ActividadDefinicion, IniciativaAutomatizacion, GrupoCelula, ProyectoConNombre } from '@/lib/toil/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createProjectedMeasurements } from '@/app/toil/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';

interface VerIniciativaDetalleProps {
    iniciativa: IniciativaAutomatizacion;
    actividades: ActividadDefinicion[];
    gruposCelula: GrupoCelula[];
    proyectos: ProyectoConNombre[];
    onDataChange: () => void;
}

const mapImpactoToLabel = (value: number | string): "Bajo" | "Medio" | "Alto" => {
    const numValue = Number(value);
    if (numValue >= 7) return "Alto";
    if (numValue >= 4) return "Medio";
    return "Bajo";
};

export default function VerIniciativaDetalle({ iniciativa, actividades, gruposCelula, proyectos, onDataChange }: VerIniciativaDetalleProps) {
    const { toast } = useToast();
    const [isCalculating, setIsCalculating] = useState(false);

    const prioridadColors: { [key: string]: string } = {
        "Crítica": "bg-red-100 text-red-800",
        "Alta": "bg-orange-100 text-orange-800",
        "Media": "bg-yellow-100 text-yellow-800",
        "Baja": "bg-blue-100 text-blue-800",
    }
    
    const estadoColors: { [key: string]: string } = {
        "Aprobada": "bg-green-100 text-green-800",
        "En progreso": "bg-blue-100 text-blue-800",
        "Propuesta": "bg-gray-100 text-gray-800",
        "Rechazada": "bg-red-100 text-red-800",
    }
    const estadoProyectoColors: { [key: string]: string } = {
        "Finalizado": "bg-green-100 text-green-800",
        "En Ejecución": "bg-blue-100 text-blue-800",
        "Planificado": "bg-gray-100 text-gray-800",
        "Cancelado": "bg-red-100 text-red-800",
        "En Pausa": "bg-yellow-100 text-yellow-800",
    }

    const impactoColors: { [key: string]: string } = {
        "Alto": "bg-red-100 text-red-800",
        "Medio": "bg-yellow-100 text-yellow-800",
        "Bajo": "bg-green-100 text-green-800",
    }
    
    const actividadesVinculadas = iniciativa.id_actividades
        .map(id => actividades.find(act => act.id_actividad === id))
        .filter((act): act is ActividadDefinicion => act !== undefined);
        
    const grupoCelulaMap = new Map(gruposCelula.map(g => [g.ID, g]));

    const proyectoAsociado = iniciativa.id_proyecto
      ? proyectos.find(p => p.id_proyecto === iniciativa.id_proyecto)
      : null;

    const handleCalculateProjection = async () => {
        if (!proyectoAsociado || !iniciativa) return;
        setIsCalculating(true);
        try {
            const result = await createProjectedMeasurements(iniciativa, proyectoAsociado);
            toast({
                title: "Proyección Calculada",
                description: `${result.count} mediciones proyectadas han sido creadas o actualizadas.`,
            });
            onDataChange();
        } catch (error) {
             console.error("Error al calcular la proyección:", error);
             toast({
                title: "Error de Cálculo",
                description: "No se pudieron generar las mediciones proyectadas.",
                variant: "destructive"
             });
        } finally {
            setIsCalculating(false);
        }
    }

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Nombre de la Iniciativa</h3>
                <p className="font-semibold">{iniciativa.nombre_iniciativa}</p>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Iniciativa ID</h3>
                    <p>{iniciativa.id_iniciativa}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Prioridad</h3>
                    <Badge className={prioridadColors[iniciativa.prioridad]}>{iniciativa.prioridad}</Badge>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                    <Badge className={estadoColors[iniciativa.estado]}>{iniciativa.estado}</Badge>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Responsable</h3>
                    <p>{iniciativa.responsable_celula}</p>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Proyecto de Automatización Vinculado</h3>
                    {proyectoAsociado && (
                        <Button size="sm" onClick={handleCalculateProjection} disabled={isCalculating}>
                            {isCalculating ? <Loader2 className="mr-2 animate-spin" /> : <Zap className="mr-2"/>}
                            {isCalculating ? 'Calculando...' : 'Calcular Proyección'}
                        </Button>
                    )}
                </div>

                {proyectoAsociado ? (
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{proyectoAsociado.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm flex justify-between items-center">
                            <span className="text-muted-foreground">ID: {proyectoAsociado.id_proyecto}</span>
                            <Badge className={cn(estadoProyectoColors[proyectoAsociado.estado_proyecto])}>
                                {proyectoAsociado.estado_proyecto}
                            </Badge>
                        </CardContent>
                    </Card>
                 ) : (
                    <p className="text-sm text-muted-foreground">No hay proyecto asociado.</p>
                 )}
            </div>
            <Separator />


            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Actividades TOIL Vinculadas</h3>
                {actividadesVinculadas.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {actividadesVinculadas.map(act => {
                            const impactoLabel = mapImpactoToLabel(act.impacto_operacion);
                            const grupo = grupoCelulaMap.get(act.id_grupo_celula);
                            return (
                                <Card key={act.id_actividad}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">Actividad #{act.id_actividad}</CardTitle>
                                        <CardDescription className="truncate">{act.actividad_detalle}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm flex justify-between items-center">
                                        <span className="text-muted-foreground">{grupo?.Title || 'N/A'}</span>
                                        <Badge className={impactoColors[impactoLabel]}>{`Impacto ${impactoLabel}`}</Badge>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No hay actividades vinculadas.</p>
                )}
            </div>

             <Separator />

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Objetivo de la Iniciativa</h3>
                    <p className="whitespace-pre-wrap">{iniciativa.objetivo_iniciativa}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Alcance</h3>
                    <p className="whitespace-pre-wrap">{iniciativa.alcance}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descripción del Problema</h3>
                    <p className="whitespace-pre-wrap">{iniciativa.descripcion_problema}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Solución Propuesta</h3>
                    <p className="whitespace-pre-wrap">{iniciativa.solucion_propuesta}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Beneficios Esperados</h3>
                    <p className="whitespace-pre-wrap">{iniciativa.beneficios_esperados}</p>
                </div>
            </div>
        </div>
    );
}
