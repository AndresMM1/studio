
import type { ProyectoConNombre } from '@/lib/toil/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Wrench, TrendingUp, CalendarCheck, Flag } from "lucide-react";


interface VerProyectoDetalleProps {
    proyecto: ProyectoConNombre;
}

export default function VerProyectoDetalle({ proyecto }: VerProyectoDetalleProps) {

    const estadoColors: { [key: string]: string } = {
        "Finalizado": "bg-green-100 text-green-800",
        "En Ejecución": "bg-blue-100 text-blue-800",
        "Planificado": "bg-gray-100 text-gray-800",
        "Cancelado": "bg-red-100 text-red-800",
        "En Pausa": "bg-yellow-100 text-yellow-800",
    }
    
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">{proyecto.nombre_iniciativa || `Proyecto #${proyecto.id_proyecto}`}</h3>
                    <p className="text-sm text-muted-foreground">
                        Iniciativa ID #{proyecto.id_iniciativa || 'N/A'}
                    </p>
                </div>
                 <Badge variant="outline" className={cn("border-0 text-base", estadoColors[proyecto.estado_proyecto])}>
                    <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5" />
                        <span>{proyecto.estado_proyecto}</span>
                    </div>
                </Badge>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Fecha de Inicio</p>
                        <p className="text-muted-foreground">{formatDate(proyecto.fecha_inicio)}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <CalendarCheck className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Fecha de Fin (Estimada)</p>
                        <p className="text-muted-foreground">{formatDate(proyecto.fecha_fin_estimada)}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-semibold">Tecnología Utilizada</p>
                        <p className="text-muted-foreground">{proyecto.tecnologia_utilizada}</p>
                    </div>
                </div>
            </div>
            
            <Separator className="my-6" />

            <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Estado de Beneficios</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{proyecto.beneficios_estado}</p>
                </div>
            </div>

        </div>
    );
}
