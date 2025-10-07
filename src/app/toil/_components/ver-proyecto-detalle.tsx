
import type { ProyectoConNombre } from '@/lib/toil/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Wrench, TrendingUp, CalendarCheck, Flag, Info, Target, GitBranch, DollarSign, Users, Smile, Briefcase, FileText, BarChart } from "lucide-react";


interface VerProyectoDetalleProps {
    proyecto: ProyectoConNombre;
}

const DetailSection = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ElementType }) => {
    const Icon = icon;
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</h3>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">{children}</div>
        </div>
    )
}

const DetailItem = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (!value && value !== 0) return null;
    return (
        <div>
            <p className="font-semibold text-foreground">{label}</p>
            <p className="whitespace-pre-wrap">{value}</p>
        </div>
    )
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
        if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    return (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold">{proyecto.titulo}</h3>
                </div>
                 <Badge variant="outline" className={cn("border-0 text-base", estadoColors[proyecto.estado_proyecto])}>
                    <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5" />
                        <span>{proyecto.estado_proyecto}</span>
                    </div>
                </Badge>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                <DetailSection title="Definición del Proyecto" icon={Info}>
                    <DetailItem label="Descripción del Problema" value={proyecto.descripcionProblema} />
                    <DetailItem label="Objetivo General" value={proyecto.objetivo} />
                    <DetailItem label="Objetivo Específico" value={proyecto.objetivoEspecifico} />
                    <DetailItem label="Situación Inicial" value={proyecto.situacionInicial} />
                    <DetailItem label="Situación Deseada" value={proyecto.situacionDeseada} />
                </DetailSection>

                <Separator/>
                
                <DetailSection title="Análisis de Beneficios" icon={TrendingUp}>
                    <DetailItem label="Beneficios Económicos" value={proyecto.beneficiosEconomicos} />
                    <DetailItem label="Beneficios para el Cliente" value={proyecto.beneficiosCliente} />
                    <DetailItem label="Beneficios para Colaboradores" value={proyecto.beneficiosColaboradores} />
                    <DetailItem label="Estado de los Beneficios" value={proyecto.beneficios_estado} />
                </DetailSection>

                <Separator/>

                <DetailSection title="Gestión y Detalles Técnicos" icon={Wrench}>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Fecha de Inicio" value={formatDate(proyecto.fecha_inicio)} />
                        <DetailItem label="Fecha de Fin" value={formatDate(proyecto.fecha_fin)} />
                    </div>
                     <DetailItem label="Tecnología" value={proyecto.tecnologia} />
                     <DetailItem label="Datos de Referencia" value={proyecto.datosReferencia} />
                     <DetailItem label="Conclusiones" value={proyecto.conclusiones} />
                </DetailSection>

                 <Separator/>

                <DetailSection title="Resultados y Variaciones" icon={BarChart}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <DetailItem label="Var. Seniority Técnico" value={proyecto.varSeniorityTecnico} />
                        <DetailItem label="Var. Seniority Operativo" value={proyecto.varSeniorityOperativo} />
                        <DetailItem label="Var. Tiempo (%)" value={`${proyecto.varTiempo}%`} />
                        <DetailItem label="Var. Involucrados (%)" value={`${proyecto.varInvolucrados}%`} />
                        <DetailItem label="Var. Frecuencia (%)" value={`${proyecto.varFrecuencia}%`} />
                    </div>
                </DetailSection>
            </div>

        </div>
    );
}

    