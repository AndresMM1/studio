
import type { IniciativaAutomatizacion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VerIniciativaDetalleProps {
    iniciativa: IniciativaAutomatizacion;
}

export default function VerIniciativaDetalle({ iniciativa }: VerIniciativaDetalleProps) {

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
                <h3 className="text-sm font-medium text-muted-foreground">Actividades TOIL Vinculadas</h3>
                <div className="flex flex-wrap gap-2">
                    {iniciativa.id_actividades.map(id => (
                        <Badge key={id} variant="outline">Actividad #{id}</Badge>
                    ))}
                </div>
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
