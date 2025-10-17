
"use client"

import { useState, useEffect, useMemo } from 'react';
import type { ActividadDefinicion, IniciativaAutomatizacion, ProyectoConNombre, GrupoCelula, ActividadMedicion } from '@/lib/toil/types';
import { getActividadesDefinicion, getIniciativasAutomatizacion, getProyectosAutomatizacion, getGruposCelula, getActividadesMedicion } from '@/lib/toil/data';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActividadesTable from './_components/actividades-table';
import IniciativasTable from './_components/iniciativas-table';
import ProyectosTable from './_components/proyectos-table';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DefinirActividadForm from "./_components/definir-actividad-form";
import RegistrarIniciativaForm from "./_components/registrar-iniciativa-form";
import CrearProyectoForm from "./_components/crear-proyecto-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MedicionesTable from './_components/mediciones-table';
import ComparacionMedicionesChart from './_components/comparacion-mediciones-chart';
import TotalAhorroChart from './_components/total-ahorro-chart';
import AhorroPorProyectoChart from './_components/impact-matrix-chart';

export default function ToilDashboardPage() {
    const [actividades, setActividades] = useState<ActividadDefinicion[]>([]);
    const [mediciones, setMediciones] = useState<ActividadMedicion[]>([]);
    const [iniciativas, setIniciativas] = useState<IniciativaAutomatizacion[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoConNombre[]>([]);
    const [gruposCelula, setGruposCelula] = useState<GrupoCelula[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isActividadDialogOpen, setIsActividadDialogOpen] = useState(false);
    const [isCreateIniciativaOpen, setIsCreateIniciativaOpen] = useState(false);
    const [isProyectoDialogOpen, setIsProyectoDialogOpen] = useState(false);
    
    const [actividadToEdit, setActividadToEdit] = useState<ActividadDefinicion | null>(null);
    const [iniciativaToEdit, setIniciativaToEdit] = useState<IniciativaAutomatizacion | null>(null);
    const [proyectoToEdit, setProyectoToEdit] = useState<ProyectoConNombre | null>(null);

    const isEditModeActividad = !!actividadToEdit;
    const isEditModeIniciativa = !!iniciativaToEdit;
    const isEditModeProyecto = !!proyectoToEdit;

    async function loadData() {
        setIsLoading(true);
        try {
            const [actividadesData, medicionesData, iniciativasData, proyectosData, gruposData] = await Promise.all([
                getActividadesDefinicion(),
                getActividadesMedicion(),
                getIniciativasAutomatizacion(),
                getProyectosAutomatizacion(),
                getGruposCelula()
            ]);
            setActividades(actividadesData);
            setMediciones(medicionesData);
            setIniciativas(iniciativasData);
            setProyectos(proyectosData);
            setGruposCelula(gruposData);
        } catch (error) {
            console.error("Error al cargar los datos de TOIL:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSuccess = () => {
        setIsActividadDialogOpen(false);
        setIsCreateIniciativaOpen(false);
        setIsProyectoDialogOpen(false);
        setActividadToEdit(null);
        setIniciativaToEdit(null);
        setProyectoToEdit(null);
        loadData(); 
    };
    
    const handleEditActividad = (actividad: ActividadDefinicion) => {
        setActividadToEdit(actividad);
        setIsActividadDialogOpen(true);
    };

    const handleEditIniciativa = (iniciativa: IniciativaAutomatizacion) => {
        setIniciativaToEdit(iniciativa);
        setIsCreateIniciativaOpen(true);
    };

    const handleEditProyecto = (proyecto: ProyectoConNombre) => {
        setProyectoToEdit(proyecto);
        setIsProyectoDialogOpen(true);
    };

    const handleOpenDialog = (dialogSetter: (isOpen: boolean) => void, editSetter: (item: any) => void) => {
        editSetter(null);
        dialogSetter(true);
    }
    
    useEffect(() => {
        if (!isActividadDialogOpen) setActividadToEdit(null);
        if (!isCreateIniciativaOpen) setIniciativaToEdit(null);
        if (!isProyectoDialogOpen) setProyectoToEdit(null);
    }, [isActividadDialogOpen, isCreateIniciativaOpen, isProyectoDialogOpen]);

    const { chartData, totalReal, totalProyectado, ahorroPorProyectoData } = useMemo(() => {
        const proyectoMap = new Map<number, { real: number, proyectada: number, nombre: string }>();

        for (const proyecto of proyectos) {
            proyectoMap.set(proyecto.id_proyecto, { real: 0, proyectada: 0, nombre: proyecto.titulo });
        }

        const medicionesPorActividad = new Map<number, { real?: ActividadMedicion, proyectada?: ActividadMedicion }>();
        for (const medicion of mediciones) {
            const entry = medicionesPorActividad.get(medicion.id_actividad) || {};
            if (medicion["Tipo Medicion"] === "Real") {
                if (!entry.real || new Date(medicion["Fecha Medicion"]) > new Date(entry.real["Fecha Medicion"])) {
                    entry.real = medicion;
                }
            } else if (medicion["Tipo Medicion"] === "Proyectada") {
                if (!entry.proyectada || new Date(medicion["Fecha Medicion"]) > new Date(entry.proyectada["Fecha Medicion"])) {
                    entry.proyectada = medicion;
                }
            }
            medicionesPorActividad.set(medicion.id_actividad, entry);
        }

        for (const iniciativa of iniciativas) {
            if (iniciativa.id_proyecto && proyectoMap.has(iniciativa.id_proyecto)) {
                const proyectoEntry = proyectoMap.get(iniciativa.id_proyecto)!;
                for (const actividadId of iniciativa.id_actividades) {
                    const medicionesActividad = medicionesPorActividad.get(actividadId);
                    if (medicionesActividad?.real) {
                        proyectoEntry.real += medicionesActividad.real["Tiempo Hrs x Mes"];
                    }
                    if (medicionesActividad?.proyectada) {
                        proyectoEntry.proyectada += medicionesActividad.proyectada["Tiempo Hrs x Mes"];
                    }
                }
            }
        }
        
        const resultChartData = Array.from(proyectoMap.values())
            .filter(p => p.real > 0 || p.proyectada > 0)
            .map(p => ({
                proyecto: p.nombre,
                real: p.real,
                proyectada: p.proyectada,
            }));

        const resultAhorroData = resultChartData.map(p => ({
            proyecto: p.proyecto,
            ahorro: p.real - p.proyectada
        })).filter(p => p.ahorro > 0);


        const totalReal = resultChartData.reduce((sum, p) => sum + p.real, 0);
        const totalProyectado = resultChartData.reduce((sum, p) => sum + p.proyectada, 0);

        return { chartData: resultChartData, totalReal, totalProyectado, ahorroPorProyectoData: resultAhorroData };
    }, [mediciones, iniciativas, proyectos]);


    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 items-center justify-between  px-4 lg:h-[60px] lg:px-6">
                <h1 className="text-xl font-bold tracking-tight">Gestión de TOIL</h1>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsActividadDialogOpen, setActividadToEdit)}>
                            Definir Actividad
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsCreateIniciativaOpen, setIniciativaToEdit)}>
                            Registrar Iniciativa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsProyectoDialogOpen, setProyectoToEdit)}>
                            Crear Proyecto
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="analisis">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="analisis">Análisis</TabsTrigger>
                                <TabsTrigger value="actividades">Actividades</TabsTrigger>
                                <TabsTrigger value="mediciones">Mediciones</TabsTrigger>
                                <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
                                <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="actividades">
                                <ActividadesTable 
                                    actividades={actividades} 
                                    gruposCelula={gruposCelula} 
                                    isLoading={isLoading} 
                                    onEdit={handleEditActividad}
                                />
                            </TabsContent>
                             <TabsContent value="mediciones">
                                <MedicionesTable 
                                    mediciones={mediciones}
                                    actividades={actividades}
                                    isLoading={isLoading}
                                />
                            </TabsContent>
                            <TabsContent value="iniciativas">
                                <IniciativasTable 
                                    iniciativas={iniciativas}
                                    actividades={actividades}
                                    gruposCelula={gruposCelula}
                                    proyectos={proyectos}
                                    isLoading={isLoading}
                                    onEdit={handleEditIniciativa}
                                    onDataChange={loadData}
                                />
                            </TabsContent>
                            <TabsContent value="proyectos">
                                <ProyectosTable 
                                    proyectos={proyectos} 
                                    isLoading={isLoading} 
                                    onEdit={handleEditProyecto}
                                />
                            </TabsContent>
                             <TabsContent value="analisis" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                               <div className="lg:col-span-2 flex flex-col gap-6">
                                    <AhorroPorProyectoChart data={ahorroPorProyectoData} isLoading={isLoading} />
                                    <ComparacionMedicionesChart 
                                        data={chartData} 
                                        isLoading={isLoading}
                                    />
                               </div>
                               <div className="lg:col-span-1 flex flex-col gap-6">
                                    <TotalAhorroChart 
                                     totalReal={totalReal}
                                     totalProyectado={totalProyectado}
                                     isLoading={isLoading}
                                   />
                               </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

             {/* Diálogo para Actividades */}
            <Dialog open={isActividadDialogOpen} onOpenChange={setIsActividadDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModeActividad ? "Editar Actividad TOIL" : "Definir Nueva Actividad TOIL"}</DialogTitle>
                        <DialogDescription>
                            {isEditModeActividad ? "Modifica los detalles de la actividad." : "Registra una nueva actividad manual y repetitiva para su posterior análisis."}
                        </DialogDescription>
                    </DialogHeader>
                    <DefinirActividadForm 
                        onSuccess={handleSuccess} 
                        gruposCelula={gruposCelula} 
                        actividadToEdit={actividadToEdit}
                        isEditMode={isEditModeActividad}
                    />
                </DialogContent>
            </Dialog>

            {/* Diálogo para Iniciativas */}
            <Dialog open={isCreateIniciativaOpen} onOpenChange={setIsCreateIniciativaOpen}>
                 <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModeIniciativa ? "Editar Iniciativa" : "Registrar Nueva Iniciativa"}</DialogTitle>
                        <DialogDescription>
                           {isEditModeIniciativa ? "Modifica los detalles de la iniciativa." : "Propón una nueva iniciativa de automatización para una o más actividades TOIL."}
                        </DialogDescription>
                    </DialogHeader>
                    <RegistrarIniciativaForm 
                        onSuccess={handleSuccess} 
                        actividades={actividades} 
                        proyectos={proyectos}
                        iniciativaToEdit={iniciativaToEdit}
                        isEditMode={isEditModeIniciativa}
                    />
                </DialogContent>
            </Dialog>

            {/* Diálogo para Proyectos */}
            <Dialog open={isProyectoDialogOpen} onOpenChange={setIsProyectoDialogOpen}>
                <DialogContent className="sm:max-w-5xl">
                    <DialogHeader>
                         <DialogTitle>{isEditModeProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto de Automatización"}</DialogTitle>
                        <DialogDescription>
                           {isEditModeProyecto ? "Actualiza la información del proyecto." : "Convierte una iniciativa aprobada en un proyecto tangible."}
                        </DialogDescription>
                    </DialogHeader>
                    <CrearProyectoForm 
                        onSuccess={handleSuccess}
                        proyectoToEdit={proyectoToEdit}
                        isEditMode={isEditModeProyecto}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
