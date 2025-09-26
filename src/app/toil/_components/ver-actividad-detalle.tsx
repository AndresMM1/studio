
import type { ActividadDefinicion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VerActividadDetalleProps {
    actividad: ActividadDefinicion;
}

export default function VerActividadDetalle({ actividad }: VerActividadDetalleProps) {

    const impactoColors: { [key: string]: string } = {
        "Alto": "bg-red-100 text-red-800",
        "Medio": "bg-yellow-100 text-yellow-800",
        "Bajo": "bg-green-100 text-green-800",
    }
    
    const complexityColors: { [key: string]: string } = {
        "Alta": "border-red-500",
        "Media": "border-yellow-500",
        "Baja": "border-green-500",
    }

    const grupoCelulaMap: { [key: number]: string } = {
        1: "Chapter de Datos",
        2: "Chapter de Frontend",
        3: "Célula de Pagos"
    };

    const actividadPracticaMap: { [key: string]: string } = {
        "gestion-incidentes": "Gestión de Incidentes",
        "desarrollo-software": "Desarrollo de Software",
        "analisis-datos": "Análisis de Datos"
    };

    const mapImpactoToLabel = (value: number | string): "Bajo" | "Medio" | "Alto" => {
        const numValue = Number(value);
        if (numValue >= 7) return "Alto";
        if (numValue >= 4) return "Medio";
        return "Bajo";
    };
    
    const impactoNegocioLabel = mapImpactoToLabel(actividad.impacto_negocio);
    const impactoOperacionLabel = mapImpactoToLabel(actividad.impacto_operacion);


    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Actividad ID</h3>
                    <p>{actividad.id_actividad}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Grupo Célula/Chapter</h3>
                    <p>{grupoCelulaMap[actividad.id_grupo_celula] || 'N/A'}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Actividad Práctica</h3>
                    <p>{actividadPracticaMap[actividad.actividad_practica] || actividad.actividad_practica}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Es TOIL</h3>
                    <Badge variant={actividad.es_toil ? "default" : "secondary"}>{actividad.es_toil ? "Sí" : "No"}</Badge>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Actividad Detalle</h3>
                <p className="whitespace-pre-wrap">{actividad.actividad_detalle}</p>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Origen de la Operación</h3>
                    <p>{actividad.origen_operacion}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Origen del Alcance</h3>
                    <p>{actividad.origen_alcance}</p>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descripción Impacto de Negocio</h3>
                    <p className="whitespace-pre-wrap">{actividad.impacto_negocio_desc}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descripción Impacto de Operación</h3>
                    <p className="whitespace-pre-wrap">{actividad.impacto_operacion_desc}</p>
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Impacto de Negocio</h3>
                    <Badge className={impactoColors[impactoNegocioLabel]}>{impactoNegocioLabel}</Badge>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Impacto de Operación</h3>
                    <Badge className={impactoColors[impactoOperacionLabel]}>{impactoOperacionLabel}</Badge>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Complejidad de Ejecución</h3>
                    <Badge variant="outline" className={complexityColors[actividad.complejidad_ejecucion]}>{actividad.complejidad_ejecucion}</Badge>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Automatizable</h3>
                    <Badge variant={actividad.automatizable ? "default" : "secondary"}>{actividad.automatizable ? "Sí" : "No"}</Badge>
                </div>
            </div>
        </div>
    );
}

    